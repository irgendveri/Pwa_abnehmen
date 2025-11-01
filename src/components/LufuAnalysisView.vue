<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useLufu } from '../composables/useLufu'
import type { Basisdaten } from '../types/database'

// Erweiterte Basisdaten mit Messungen
interface BasisdatenWithMessungen extends Basisdaten {
  messungen: {
    id: number;
    parameter: string;
    soll: number | null;
    ugw: number | null;
    versuch_1: number | null;
    versuch_2: number | null;
    versuch_3: number | null;
    bester_versuch: number | null;
    soll_prozent: number | null;
  }[]
}

const { loadBasisdaten, loading, error, updateMessung } = useLufu()

const data = ref<BasisdatenWithMessungen[]>([])
const currentIndex = ref(0)
const editMode = ref(false)
const editData = ref<Record<number, {
  soll: string;
  ugw: string;
  versuch_1: string;
  versuch_2: string;
  versuch_3: string;
  soll_prozent: string;
}>>({})

// Chart-related data
const selectedParameter = ref<'FVC' | 'FEV1' | 'FEV1/FVC'>('FVC')
const showChart = ref(false)

// Tooltip data
const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  content: '',
  date: '',
  value: 0,
  attempt: 0,
  isSoll: false
})

// Aktueller Eintrag
const currentEntry = computed(() => {
  return data.value[currentIndex.value] || null
})

// Navigation
const canGoNext = computed(() => currentIndex.value < data.value.length - 1)
const canGoPrev = computed(() => currentIndex.value > 0)

const goNext = () => {
  if (canGoNext.value) {
    currentIndex.value++
  }
}

const goPrev = () => {
  if (canGoPrev.value) {
    currentIndex.value--
  }
}

// Datum formatieren
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Zahlenwerte formatieren (2 Dezimalstellen oder '-' wenn null)
const formatValue = (value: number | null): string => {
  if (value === null || value === undefined) return '-'
  return value.toFixed(2)
}

// Prüfe ob ein Versuch einen Wert hat
const hasValue = (value: number | null): boolean => {
  return value !== null && value !== undefined
}

// Computed properties um zu prüfen, ob Versuchsspalten angezeigt werden sollen
const hasAnyVersuch1 = computed(() => {
  return sortedMessungen.value.some(m => hasValue(m.versuch_1))
})

const hasAnyVersuch2 = computed(() => {
  return sortedMessungen.value.some(m => hasValue(m.versuch_2))
})

const hasAnyVersuch3 = computed(() => {
  return sortedMessungen.value.some(m => hasValue(m.versuch_3))
})

// Computed property um zu prüfen, ob die Soll-Spalte angezeigt werden soll
const hasAnySoll = computed(() => {
  return sortedMessungen.value.some(m => hasValue(m.soll))
})

// Definierte Reihenfolge der Parameter
const parameterOrder = [
  'FVC',
  'FEV1',
  'FEV1/FVC',
  'FEF25-75%',
  'PEF',
  'FET',
  'FIVC',
  'PIF',
  'MEF75',
  'MEF50',
  'MEF25'
]

// Sortierte Messungen nach definierter Reihenfolge
const sortedMessungen = computed(() => {
  if (!currentEntry.value?.messungen) return []

  return [...currentEntry.value.messungen].sort((a, b) => {
    const indexA = parameterOrder.indexOf(a.parameter)
    const indexB = parameterOrder.indexOf(b.parameter)

    // Falls Parameter nicht in der Liste ist, ans Ende setzen
    if (indexA === -1 && indexB === -1) return 0
    if (indexA === -1) return 1
    if (indexB === -1) return -1

    return indexA - indexB
  })
})

// Chart data computation
const chartData = computed(() => {
  if (data.value.length === 0) return { sollValues: [], measuredValues: [] }

  const sollValues: { date: string; value: number; entryIndex: number }[] = []
  const measuredValues: { date: string; value: number; isLow: boolean; attempt: number; entryIndex: number; sollProzent: number | null }[] = []

  data.value.forEach((entry, entryIndex) => {
    const messung = entry.messungen.find(m => m.parameter === selectedParameter.value)
    if (!messung) return

    const date = entry.datum

    // Sollwerte (grün)
    if (messung.soll !== null && messung.soll !== undefined) {
      sollValues.push({ date, value: messung.soll, entryIndex })
    }

    // Gemessene Werte (blau/rot)
    const attempts = [
      { value: messung.versuch_1, attempt: 1 },
      { value: messung.versuch_2, attempt: 2 },
      { value: messung.versuch_3, attempt: 3 }
    ]

    attempts.forEach(({ value, attempt }) => {
      if (value !== null && value !== undefined) {
        // Für FEV1/FVC: Werte < 70% sind kritisch
        // Für andere Parameter: soll_prozent < 80% sind kritisch
        const isLow = selectedParameter.value === 'FEV1/FVC'
          ? value < 70
          : messung.soll_prozent !== null && messung.soll_prozent < 80
        measuredValues.push({
          date,
          value,
          isLow,
          attempt,
          entryIndex,
          sollProzent: messung.soll_prozent
        })
      }
    })
  })

  return { sollValues, measuredValues }
})

// Informationstext für gewählten Parameter
const parameterInfo = computed(() => {
  switch (selectedParameter.value) {
    case 'FVC':
      return 'FVC: verringerte Vitalkapazität. Belüftungsstörung möglich.'
    case 'FEV1':
      return 'FEV1: Angabe der Luftmenge. Bei Obstruktion ist dieser Wert erniedrigt.'
    case 'FEV1/FVC':
      return 'FEV1/FVC: Ein Wert < 70% deutet auf Obstruktion hin.'
    default:
      return ''
  }
})

// Normwerte-Text für gewählten Parameter
const normalValuesText = computed(() => {
  switch (selectedParameter.value) {
    case 'FEV1/FVC':
      return 'Normwerte liegen über 70% (Werte < 70% in rot dargestellt).'
    case 'FVC':
    case 'FEV1':
    default:
      return 'Normwerte liegen zwischen 80% und 120% (Werte < 80% Soll in rot dargestellt).'
  }
})

// Toggle chart visibility
const toggleChart = () => {
  showChart.value = !showChart.value
}

// Change selected parameter
const selectParameter = (parameter: 'FVC' | 'FEV1' | 'FEV1/FVC') => {
  selectedParameter.value = parameter
}

// Helper functions for chart
const getMaxValue = () => {
  if (chartData.value.sollValues.length === 0 && chartData.value.measuredValues.length === 0) return 10

  const allValues = [
    ...chartData.value.sollValues.map(v => v.value),
    ...chartData.value.measuredValues.map(v => v.value)
  ]

  return Math.max(...allValues, 10) * 1.1 // 10% Puffer oben
}

const getDateIndex = (date: string) => {
  return data.value.findIndex(entry => entry.datum === date)
}

const getBlueShade = (attempt: number) => {
  switch (attempt) {
    case 1: return '#3498db'
    case 2: return '#2980b9'
    case 3: return '#1f3a93'
    default: return '#3498db'
  }
}

const getDarkBlueShade = (attempt: number) => {
  switch (attempt) {
    case 1: return '#2980b9'
    case 2: return '#1f3a93'
    case 3: return '#0f1c47'
    default: return '#2980b9'
  }
}

const formatDateShort = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit'
  })
}

// Tooltip functions
const showTooltip = (event: MouseEvent, point: { date: string; value: number; attempt?: number; sollProzent?: number | null }, isSoll: boolean = false) => {
  const svgRect = (event.currentTarget as SVGElement).getBoundingClientRect()

  tooltip.value = {
    show: true,
    x: event.clientX - svgRect.left + 10,
    y: event.clientY - svgRect.top - 10,
    content: isSoll ?
      `Sollwert: ${formatValue(point.value)}` :
      `Versuch ${point.attempt}: ${formatValue(point.value)}${point.sollProzent ? ` (${formatValue(point.sollProzent)}% Soll)` : ''}`,
    date: formatDate(point.date),
    value: point.value,
    attempt: point.attempt || 0,
    isSoll
  }
}

const hideTooltip = () => {
  tooltip.value.show = false
}

// Click handler to navigate to specific measurement
const goToMeasurement = (entryIndex: number) => {
  currentIndex.value = entryIndex
  hideTooltip()
}

// Bearbeitungsmodus aktivieren
const startEdit = () => {
  if (sortedMessungen.value.length === 0) return

  editMode.value = true
  editData.value = {}

  // Initialisiere editData mit aktuellen Werten
  sortedMessungen.value.forEach(messung => {
    editData.value[messung.id] = {
      soll: messung.soll?.toString() || '',
      ugw: messung.ugw?.toString() || '',
      versuch_1: messung.versuch_1?.toString() || '',
      versuch_2: messung.versuch_2?.toString() || '',
      versuch_3: messung.versuch_3?.toString() || '',
      soll_prozent: messung.soll_prozent?.toString() || ''
    }
  })
}// Bearbeitung abbrechen
const cancelEdit = () => {
  editMode.value = false
  editData.value = {}
}

// Änderungen speichern
const saveEdit = async () => {
  if (sortedMessungen.value.length === 0) return

  try {
    for (const messung of sortedMessungen.value) {
      const editValues = editData.value[messung.id]
      if (!editValues) continue

      const updateData = {
        soll: editValues.soll ? parseFloat(editValues.soll) : null,
        ugw: editValues.ugw ? parseFloat(editValues.ugw) : null,
        versuch_1: editValues.versuch_1 ? parseFloat(editValues.versuch_1) : null,
        versuch_2: editValues.versuch_2 ? parseFloat(editValues.versuch_2) : null,
        versuch_3: editValues.versuch_3 ? parseFloat(editValues.versuch_3) : null,
        soll_prozent: editValues.soll_prozent ? parseFloat(editValues.soll_prozent) : null
      }

      await updateMessung(messung.id, updateData)
    }

    // Daten neu laden
    await loadData()
    editMode.value = false
    editData.value = {}
  } catch (err) {
    console.error('Fehler beim Speichern:', err)
  }
}// Daten laden
const loadData = async () => {
  const result = await loadBasisdaten()
  data.value = result
  currentIndex.value = 0
}

onMounted(() => {
  loadData()
  // Keyboard Navigation
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Keyboard Navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') {
    goPrev()
  } else if (event.key === 'ArrowRight') {
    goNext()
  }
}
</script>

<template>
  <div class="lufu-analysis-view">
    <h2>Lungenfunktions-Auswertung</h2>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Lade Daten...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>Fehler beim Laden der Daten: {{ error }}</p>
      <button @click="loadData" class="retry-btn">Erneut versuchen</button>
    </div>

    <!-- No Data State -->
    <div v-else-if="data.length === 0" class="no-data-state">
      <p>Noch keine Lungenfunktionsdaten vorhanden.</p>
    </div>

    <!-- Data Display -->
    <div v-else class="data-display">
      <!-- Navigation Header -->
      <div class="navigation-header">
        <button
          @click="goPrev"
          :disabled="!canGoPrev"
          class="nav-btn nav-btn-left"
          title="Vorheriger Eintrag (←)"
        >
          ←
        </button>

        <div class="entry-counter">
          {{ currentIndex + 1 }} von {{ data.length }}
        </div>

        <button
          @click="goNext"
          :disabled="!canGoNext"
          class="nav-btn nav-btn-right"
          title="Nächster Eintrag (→)"
        >
          →
        </button>
      </div>

      <!-- Current Entry Display -->
      <div v-if="currentEntry" class="entry-card">
        <div class="entry-info">
          <div class="entry-row">
            <span class="label">Datum:</span>
            <span class="value">
              {{ formatDate(currentEntry.datum) }}
              <span v-if="currentEntry.messung_kh" class="hospital-icon" title="Krankenhaus-Messung">🏥</span>
            </span>
          </div>

          <div class="entry-row">
            <span class="label">Größe / Gewicht:</span>
            <span class="value">
              {{ currentEntry.groesse_cm ? `${currentEntry.groesse_cm} cm` : '-' }} /
              {{ currentEntry.gewicht_kg ? `${currentEntry.gewicht_kg} kg` : '-' }}
            </span>
          </div>

          <div class="entry-row main-result">
            <span class="label">Gesamt Soll %:</span>
            <span class="value result-value">
              {{ currentEntry.gesamt_soll_prozent ? `${currentEntry.gesamt_soll_prozent}%` : 'Nicht erfasst' }}
            </span>
          </div>
        </div>

        <!-- Messungen Tabelle -->
        <div v-if="sortedMessungen.length > 0" class="measurements-table">
          <div class="measurements-header">
            <h3>Messungen</h3>
            <button
              v-if="!editMode"
              @click="startEdit"
              class="edit-btn"
              title="Messungen bearbeiten"
            >
              ✏️
            </button>
            <div v-if="editMode" class="edit-actions">
              <button @click="saveEdit" class="save-btn" title="Änderungen speichern">💾</button>
              <button @click="cancelEdit" class="cancel-btn" title="Bearbeitung abbrechen">❌</button>
            </div>
          </div>
          <div class="table-container">
            <table class="measurements">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th v-if="hasAnySoll">Soll</th>
                  <th>UGW</th>
                  <th>Bester</th>
                  <th v-if="hasAnyVersuch1">Vers. 1</th>
                  <th v-if="hasAnyVersuch2">Vers. 2</th>
                  <th v-if="hasAnyVersuch3">Vers. 3</th>
                  <th>%Soll</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="messung in sortedMessungen" :key="messung.parameter">
                  <td class="parameter-name">{{ messung.parameter }}</td>

                  <!-- Soll Spalte -->
                  <td v-if="hasAnySoll">
                    <input
                      v-if="editMode && editData[messung.id]"
                      v-model="editData[messung.id]!.soll"
                      type="number"
                      step="0.01"
                      class="edit-input"
                    />
                    <span v-else>{{ formatValue(messung.soll) }}</span>
                  </td>

                  <!-- UGW Spalte -->
                  <td>
                    <input
                      v-if="editMode && editData[messung.id]"
                      v-model="editData[messung.id]!.ugw"
                      type="number"
                      step="0.01"
                      class="edit-input"
                    />
                    <span v-else>{{ formatValue(messung.ugw) }}</span>
                  </td>

                  <!-- Bester Wert (nur anzeigen, wird automatisch berechnet) -->
                  <td class="best-value">{{ formatValue(messung.bester_versuch) }}</td>

                  <!-- Versuch 1 -->
                  <td v-if="hasAnyVersuch1">
                    <input
                      v-if="editMode && editData[messung.id]"
                      v-model="editData[messung.id]!.versuch_1"
                      type="number"
                      step="0.01"
                      class="edit-input"
                    />
                    <span v-else>{{ formatValue(messung.versuch_1) }}</span>
                  </td>

                  <!-- Versuch 2 -->
                  <td v-if="hasAnyVersuch2">
                    <input
                      v-if="editMode && editData[messung.id]"
                      v-model="editData[messung.id]!.versuch_2"
                      type="number"
                      step="0.01"
                      class="edit-input"
                    />
                    <span v-else>{{ formatValue(messung.versuch_2) }}</span>
                  </td>

                  <!-- Versuch 3 -->
                  <td v-if="hasAnyVersuch3">
                    <input
                      v-if="editMode && editData[messung.id]"
                      v-model="editData[messung.id]!.versuch_3"
                      type="number"
                      step="0.01"
                      class="edit-input"
                    />
                    <span v-else>{{ formatValue(messung.versuch_3) }}</span>
                  </td>

                  <!-- Soll Prozent -->
                  <td class="soll-percent">
                    <input
                      v-if="editMode && editData[messung.id]"
                      v-model="editData[messung.id]!.soll_prozent"
                      type="number"
                      step="0.01"
                      class="edit-input"
                    />
                    <span v-else>{{ messung.soll_prozent ? formatValue(messung.soll_prozent) + '%' : '-' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Chart Section -->
      <div v-if="data.length > 1" class="chart-section">
        <div class="chart-header">
          <h3>Verlaufsdiagramm</h3>
          <button @click="toggleChart" class="chart-toggle-btn">
            {{ showChart ? 'Diagramm ausblenden' : 'Diagramm anzeigen' }}
          </button>
        </div>

        <div v-if="showChart" class="chart-container">
          <!-- Parameter Selection -->
          <div class="parameter-selection">
            <h4>Parameter auswählen:</h4>
            <div class="parameter-buttons">
              <button
                v-for="param in ['FVC', 'FEV1', 'FEV1/FVC']"
                :key="param"
                @click="selectParameter(param as 'FVC' | 'FEV1' | 'FEV1/FVC')"
                :class="['parameter-btn', { active: selectedParameter === param }]"
              >
                {{ param }}
              </button>
            </div>
          </div>

          <!-- Parameter Info -->
          <div class="parameter-info">
            <p class="info-text">{{ parameterInfo }}</p>
            <p class="normal-values">{{ normalValuesText }}</p>
          </div>

          <!-- Simple Line Chart -->
          <div class="chart-display">
            <div class="chart-title">{{ selectedParameter }} Verlauf</div>
            <div class="chart-canvas">
              <svg viewBox="0 0 800 400" class="line-chart">
                <!-- Chart Grid -->
                <defs>
                  <pattern id="grid" width="80" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 80 0 L 0 0 0 40" fill="none" stroke="var(--border-light)" stroke-width="1" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="800" height="400" fill="url(#grid)" />

                <!-- Chart content will be rendered here -->
                <g class="chart-content">
                  <!-- Sollwerte (grün) -->
                  <g class="soll-line">
                    <template v-if="chartData.sollValues.length > 1">
                      <polyline
                        :points="chartData.sollValues.map((point, index) =>
                          `${750 - (index * (700 / (chartData.sollValues.length - 1)))},${350 - (point.value * 250 / getMaxValue())}`
                        ).join(' ')"
                        fill="none"
                        stroke="#27ae60"
                        stroke-width="3"
                      />
                      <circle
                        v-for="(point, index) in chartData.sollValues"
                        :key="`soll-${index}`"
                        :cx="750 - (index * (700 / (chartData.sollValues.length - 1)))"
                        :cy="350 - (point.value * 250 / getMaxValue())"
                        r="4"
                        fill="#27ae60"
                        class="chart-point soll-point"
                        @mouseover="showTooltip($event, point, true)"
                        @mouseleave="hideTooltip"
                        @click="goToMeasurement(point.entryIndex)"
                      />
                    </template>
                  </g>

                  <!-- Gemessene Werte (blau/rot) -->
                  <g class="measured-points">
                    <circle
                      v-for="(point, index) in chartData.measuredValues"
                      :key="`measured-${index}`"
                      :cx="750 - (getDateIndex(point.date) * (700 / Math.max(data.length - 1, 1)))"
                      :cy="350 - (point.value * 250 / getMaxValue())"
                      :r="point.attempt === 1 ? 6 : point.attempt === 2 ? 5 : 4"
                      :fill="point.isLow ? '#e74c3c' : getBlueShade(point.attempt)"
                      :stroke="point.isLow ? '#c0392b' : getDarkBlueShade(point.attempt)"
                      stroke-width="2"
                      class="chart-point measured-point"
                      @mouseover="showTooltip($event, point, false)"
                      @mouseleave="hideTooltip"
                      @click="goToMeasurement(point.entryIndex)"
                    />
                  </g>
                </g>

                <!-- Y-Axis Labels -->
                <g class="y-axis-labels">
                  <text x="30" y="365" fill="var(--text-secondary)" font-size="12" text-anchor="end">0</text>
                  <text x="30" y="285" fill="var(--text-secondary)" font-size="12" text-anchor="end">{{ (getMaxValue() * 0.25).toFixed(1) }}</text>
                  <text x="30" y="205" fill="var(--text-secondary)" font-size="12" text-anchor="end">{{ (getMaxValue() * 0.5).toFixed(1) }}</text>
                  <text x="30" y="125" fill="var(--text-secondary)" font-size="12" text-anchor="end">{{ (getMaxValue() * 0.75).toFixed(1) }}</text>
                  <text x="30" y="45" fill="var(--text-secondary)" font-size="12" text-anchor="end">{{ getMaxValue().toFixed(1) }}</text>
                </g>

                <!-- X-Axis Labels (Dates) -->
                <g class="x-axis-labels">
                  <text
                    v-for="(entry, index) in data"
                    :key="`date-${index}`"
                    :x="750 - (index * (700 / Math.max(data.length - 1, 1)))"
                    y="385"
                    fill="var(--text-secondary)"
                    font-size="10"
                    text-anchor="middle"
                  >
                    {{ formatDateShort(entry.datum) }}
                  </text>
                </g>
              </svg>
            </div>

            <!-- Tooltip -->
            <div
              v-if="tooltip.show"
              class="chart-tooltip"
              :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
            >
              <div class="tooltip-date">{{ tooltip.date }}</div>
              <div class="tooltip-content">{{ tooltip.content }}</div>
              <div class="tooltip-hint">Klicken zum Anzeigen</div>
            </div>

            <!-- Legend -->
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color soll-color"></div>
                <span>Sollwerte</span>
              </div>
              <div class="legend-item">
                <div class="legend-color measured-color-1"></div>
                <span>Versuch 1</span>
              </div>
              <div class="legend-item">
                <div class="legend-color measured-color-2"></div>
                <span>Versuch 2</span>
              </div>
              <div class="legend-item">
                <div class="legend-color measured-color-3"></div>
                <span>Versuch 3</span>
              </div>
              <div class="legend-item">
                <div class="legend-color low-color"></div>
                <span>&lt; 80% Soll</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Hint -->
      <div class="navigation-hint">
        <p>Verwende die Pfeiltasten ← → oder die Buttons zum Navigieren</p>
      </div>
    </div>
  </div>

</template>

<style scoped>
/* Lufu Analysis View Styles */
.lufu-analysis-view {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.lufu-analysis-view h2 {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

/* State Styles */
.loading-state, .error-state, .no-data-state {
  background-color: var(--bg-secondary);
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  border: 2px dashed var(--border-color);
}

.loading-state p, .no-data-state p {
  color: var(--text-secondary);
  margin: 0;
}

.error-state p {
  color: var(--error-color, #e74c3c);
  margin-bottom: 1rem;
}

.retry-btn {
  background-color: var(--accent-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: var(--accent-primary-hover, #3498db);
}

/* Data Display */
.data-display {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Navigation Header */
.navigation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
}

.nav-btn {
  background-color: var(--accent-primary);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover:not(:disabled) {
  background-color: var(--accent-primary-hover, #3498db);
  transform: scale(1.05);
}

.nav-btn:disabled {
  background-color: var(--text-disabled, #bdc3c7);
  cursor: not-allowed;
  transform: none;
}

.entry-counter {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1.1rem;
}

/* Entry Card */
.entry-card {
  background-color: var(--bg-primary);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.entry-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.entry-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-light, #ecf0f1);
}

.entry-row:last-child {
  border-bottom: none;
}

.entry-row.main-result {
  background-color: var(--accent-light, #e8f4f8);
  padding: 1rem;
  border-radius: 6px;
  border: 2px solid var(--accent-primary);
  margin: 0.5rem 0;
}

.label {
  color: var(--text-secondary);
  font-weight: 500;
  flex-shrink: 0;
}

.value {
  color: var(--text-primary);
  font-weight: 600;
  text-align: right;
}

.result-value {
  color: var(--accent-primary);
  font-size: 1.2rem;
  font-weight: 700;
}

/* Hospital Icon */
.hospital-icon {
  margin-left: 0.5rem;
  font-size: 1.1rem;
  display: inline-block;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Navigation Hint */
.navigation-hint {
  margin-top: 1.5rem;
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light, #ecf0f1);
}

.navigation-hint p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
  font-style: italic;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .lufu-analysis-view {
    padding: 1rem;
  }

  .data-display {
    padding: 1rem;
  }

  .entry-card {
    padding: 1rem;
  }

  .entry-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .entry-row.main-result {
    flex-direction: row;
    align-items: center;
  }

  .value {
    text-align: left;
  }

  .nav-btn {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }

  .entry-counter {
    font-size: 1rem;
  }

  .navigation-hint p {
    font-size: 0.8rem;
  }
}

/* Focus states for accessibility */
.nav-btn:focus {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.retry-btn:focus {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Measurements Table */
.measurements-table {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--border-color);
}

.measurements-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.measurements-table h3 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1.2rem;
}

/* Edit Controls */
.edit-btn {
  background-color: var(--accent-primary);
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:hover {
  background-color: var(--accent-primary-hover, #3498db);
  transform: scale(1.05);
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.save-btn {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.save-btn:hover {
  background-color: #2ecc71;
  transform: scale(1.05);
}

.cancel-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background-color: #c0392b;
  transform: scale(1.05);
}

/* Edit Input Fields */
.edit-input {
  width: 100%;
  max-width: 80px;
  padding: 0.25rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  text-align: center;
  font-size: 0.85rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.edit-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.table-container {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.measurements {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--bg-primary);
  font-size: 0.9rem;
}

.measurements th {
  background-color: var(--accent-primary);
  color: white;
  padding: 0.75rem 0.5rem;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.measurements th:last-child {
  border-right: none;
}

.measurements td {
  padding: 0.75rem 0.5rem;
  text-align: center;
  border-bottom: 1px solid var(--border-light, #ecf0f1);
  border-right: 1px solid var(--border-light, #ecf0f1);
}

.measurements td:last-child {
  border-right: none;
}

.measurements tbody tr:hover {
  background-color: var(--accent-light, #f8f9fa);
}

.measurements tbody tr:last-child td {
  border-bottom: none;
}

.parameter-name {
  font-weight: 600;
  color: var(--text-primary);
  text-align: left !important;
  background-color: var(--bg-secondary);
}

.best-value {
  font-weight: 700;
  color: var(--accent-primary);
  background-color: var(--accent-light, #e8f4f8);
}

.soll-percent {
  font-weight: 600;
  color: var(--accent-primary);
}

/* Mobile optimizations for table */
@media (max-width: 768px) {
  .measurements-table {
    margin-top: 1.5rem;
    padding-top: 1rem;
  }

  .measurements-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .edit-actions {
    align-self: flex-end;
  }

  .measurements {
    font-size: 0.8rem;
  }

  .measurements th,
  .measurements td {
    padding: 0.5rem 0.25rem;
  }

  .measurements th {
    font-size: 0.75rem;
  }

  .table-container {
    border-radius: 6px;
  }

  .edit-input {
    max-width: 60px;
    font-size: 0.75rem;
    padding: 0.2rem;
  }

  .edit-btn, .save-btn, .cancel-btn {
    padding: 0.4rem;
    font-size: 0.9rem;
  }
}

/* Sehr schmale Bildschirme - Tabelle wird scrollbar */
@media (max-width: 480px) {
  .table-container {
    border-radius: 4px;
  }

  .measurements {
    min-width: 600px; /* Mindestbreite um Lesbarkeit zu gewährleisten */
    font-size: 0.75rem;
  }

  .measurements th,
  .measurements td {
    padding: 0.4rem 0.2rem;
  }
}

/* Chart Styles */
.chart-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--border-color);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-header h3 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1.2rem;
}

.chart-toggle-btn {
  background-color: var(--accent-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.chart-toggle-btn:hover {
  background-color: var(--accent-primary-hover, #3498db);
  transform: scale(1.05);
}

.chart-container {
  background-color: var(--bg-primary);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  margin-top: 1rem;
}

.parameter-selection {
  margin-bottom: 1.5rem;
}

.parameter-selection h4 {
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
}

.parameter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.parameter-btn {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  font-weight: 500;
}

.parameter-btn:hover {
  background-color: var(--accent-light, #e8f4f8);
  border-color: var(--accent-primary);
}

.parameter-btn.active {
  background-color: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.parameter-info {
  background-color: var(--accent-light, #e8f4f8);
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  border-left: 4px solid var(--accent-primary);
}

.info-text {
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.normal-values {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.9rem;
  font-style: italic;
}

.chart-display {
  margin-top: 1.5rem;
}

.chart-title {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
}

.chart-canvas {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.line-chart {
  width: 100%;
  height: auto;
  max-height: 400px;
  position: relative;
}

/* Chart Points */
.chart-point {
  cursor: pointer;
  transition: all 0.2s ease;
}

.chart-point:hover {
  r: 8;
  filter: brightness(1.2);
}

.soll-point:hover {
  stroke: #1e8449;
  stroke-width: 2;
}

.measured-point:hover {
  stroke-width: 3;
}

/* Tooltip */
.chart-tooltip {
  position: absolute;
  background-color: var(--bg-primary);
  border: 2px solid var(--accent-primary);
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  pointer-events: none;
  min-width: 180px;
  font-size: 0.9rem;
}

.tooltip-date {
  font-weight: 600;
  color: var(--accent-primary);
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
}

.tooltip-content {
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.tooltip-hint {
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-style: italic;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid;
}

.soll-color {
  background-color: #27ae60;
  border-color: #27ae60;
}

.measured-color-1 {
  background-color: #3498db;
  border-color: #2980b9;
}

.measured-color-2 {
  background-color: #2980b9;
  border-color: #1f3a93;
}

.measured-color-3 {
  background-color: #1f3a93;
  border-color: #0f1c47;
}

.low-color {
  background-color: #e74c3c;
  border-color: #c0392b;
}

/* Mobile optimizations for chart */
@media (max-width: 768px) {
  .chart-section {
    margin-top: 1.5rem;
    padding-top: 1rem;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .chart-container {
    padding: 1rem;
  }

  .parameter-buttons {
    justify-content: center;
  }

  .parameter-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .chart-legend {
    gap: 1rem;
    padding: 0.75rem;
  }

  .legend-item {
    font-size: 0.8rem;
  }

  .legend-color {
    width: 14px;
    height: 14px;
  }

  .chart-canvas {
    padding: 0.5rem;
  }

  .chart-tooltip {
    min-width: 160px;
    font-size: 0.8rem;
    padding: 0.5rem;
  }

  .tooltip-date {
    font-size: 0.75rem;
  }

  .tooltip-hint {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .parameter-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .parameter-btn {
    text-align: center;
  }

  .chart-legend {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .entry-row.main-result {
    background-color: rgba(52, 152, 219, 0.1);
  }

  .measurements tbody tr:hover {
    background-color: rgba(52, 152, 219, 0.05);
  }

  .best-value {
    background-color: rgba(52, 152, 219, 0.1);
  }

  .parameter-name {
    background-color: var(--bg-tertiary, #2c3e50);
  }

  .chart-canvas {
    background-color: var(--bg-secondary, #34495e);
  }

  .parameter-info {
    background-color: rgba(52, 152, 219, 0.1);
  }

  .chart-tooltip {
    background-color: var(--bg-secondary, #34495e);
    border-color: var(--accent-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}
</style>
