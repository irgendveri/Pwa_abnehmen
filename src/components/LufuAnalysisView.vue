<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useLufu } from '../composables/useLufu'
import type { Basisdaten } from '../types/database'

// Erweiterte Basisdaten mit Messungen
interface BasisdatenWithMessungen extends Basisdaten {
  messungen: {
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

const { loadBasisdaten, loading, error } = useLufu()

const data = ref<BasisdatenWithMessungen[]>([])
const currentIndex = ref(0)

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
  if (!currentEntry.value?.messungen) return false
  return currentEntry.value.messungen.some(m => hasValue(m.versuch_1))
})

const hasAnyVersuch2 = computed(() => {
  if (!currentEntry.value?.messungen) return false
  return currentEntry.value.messungen.some(m => hasValue(m.versuch_2))
})

const hasAnyVersuch3 = computed(() => {
  if (!currentEntry.value?.messungen) return false
  return currentEntry.value.messungen.some(m => hasValue(m.versuch_3))
})

// Computed property um zu prüfen, ob die Soll-Spalte angezeigt werden soll
const hasAnySoll = computed(() => {
  if (!currentEntry.value?.messungen) return false
  return currentEntry.value.messungen.some(m => hasValue(m.soll))
})

// Daten laden
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
        <div v-if="currentEntry.messungen && currentEntry.messungen.length > 0" class="measurements-table">
          <h3>Messungen</h3>
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
                <tr v-for="messung in currentEntry.messungen" :key="messung.parameter">
                  <td class="parameter-name">{{ messung.parameter }}</td>
                  <td v-if="hasAnySoll">{{ formatValue(messung.soll) }}</td>
                  <td>{{ formatValue(messung.ugw) }}</td>
                  <td class="best-value">{{ formatValue(messung.bester_versuch) }}</td>
                  <td v-if="hasAnyVersuch1">{{ formatValue(messung.versuch_1) }}</td>
                  <td v-if="hasAnyVersuch2">{{ formatValue(messung.versuch_2) }}</td>
                  <td v-if="hasAnyVersuch3">{{ formatValue(messung.versuch_3) }}</td>
                  <td class="soll-percent">{{ messung.soll_prozent ? formatValue(messung.soll_prozent) + '%' : '-' }}</td>
                </tr>
              </tbody>
            </table>
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

.measurements-table h3 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.2rem;
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
}
</style>
