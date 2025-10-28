<template>
  <div class="charts-container">
    <h3>Messwerte Verlauf</h3>

    <div v-if="authLoading || loading">
      Lade Daten...
    </div>

    <div v-else-if="!user" class="error">
      Sie müssen angemeldet sein, um Ihre Messwerte zu sehen.
    </div>

    <div v-else-if="error" class="error">
      Fehler: {{ error }}
    </div>

    <div v-else-if="werte.length === 0" >
      <p>Keine Daten vorhanden. Bitte fügen Sie zuerst Messwerte hinzu.</p>
      <button @click="loadData" class="reload-button" :disabled="loading">
        <svg
          class="reload-icon"
          :class="{ spinning: loading }"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Refresh icon mit zwei kreisförmigen Pfeilen -->
          <path
            d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12Z"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          />
          <!-- Oberer Pfeil -->
          <path
            d="M8 7L12 3L16 7"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
          <!-- Unterer Pfeil -->
          <path
            d="M16 17L12 21L8 17"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
          <!-- Mittlere Linie für bessere Sichtbarkeit -->
          <path
            d="M12 7V17"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        {{ loading ? 'Laden...' : 'Daten neu laden' }}
      </button>
    </div>

    <div v-else-if="user && werte.length > 0" class="charts-grid">
      <!-- Gewicht Chart - nur anzeigen wenn Daten vorhanden -->
      <div v-if="hasGewichtData" class="chart-item">
        <h3>Gewichtsverlauf</h3>
        <apexchart
          type="line"
          height="250"
          :options="gewichtChartOptions"
          :series="gewichtSeries"
        />
      </div>

      <!-- Taille Chart - nur anzeigen wenn Daten vorhanden -->
      <div v-if="hasTailleData" class="chart-item">
        <h3>Taillenverlauf</h3>
        <apexchart
          type="line"
          height="250"
          :options="tailleChartOptions"
          :series="tailleSeries"
        />
      </div>

      <!-- Bauch Chart - nur anzeigen wenn Daten vorhanden -->
      <div v-if="hasBauchData" class="chart-item">
        <h3>Bauchverlauf</h3>
        <apexchart
          type="line"
          height="250"
          :options="bauchChartOptions"
          :series="bauchSeries"
        />
      </div>

      <!-- Po Chart - nur anzeigen wenn Daten vorhanden -->
      <div v-if="hasPoData" class="chart-item">
        <h3>Po-Verlauf</h3>
        <apexchart
          type="line"
          height="250"
          :options="poChartOptions"
          :series="poSeries"
        />
      </div>

      <!-- Oberschenkel Chart - nur anzeigen wenn Daten vorhanden -->
      <div v-if="hasOberschenkelData" class="chart-item">
        <h3>Oberschenkelverlauf</h3>
        <apexchart
          type="line"
          height="250"
          :options="oberschenkelChartOptions"
          :series="oberschenkelSeries"
        />
      </div>

      <!-- Nachricht wenn keine Charts angezeigt werden können -->
      <div v-if="!hasAnyChartData" class="no-data">
        Es sind Datensätze vorhanden, aber alle Messwerte sind leer oder null. Bitte tragen Sie vollständige Messwerte ein.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { useWerte } from '../composables/useWerte'
import { useAuthStore } from '../stores/auth'
import { useTheme } from '../composables/useTheme'

// ApexCharts komponente registrieren
const apexchart = VueApexCharts

const { user, loading: authLoading } = useAuthStore()
const { werte, loading, error, fetchWerte } = useWerte()
const { isDark } = useTheme()

// Daten laden wenn Benutzer authentifiziert ist
const loadData = async () => {
  console.log('loadData called:', {
    hasUser: !!user.value,
    userId: user.value?.id,
    authLoading: authLoading.value
  })

  if (user.value && !authLoading.value) {
    console.log('Calling fetchWerte...')
    await fetchWerte()
    console.log('fetchWerte completed. Werte count:', werte.value.length)
  } else {
    console.log('Not loading data:', { hasUser: !!user.value, authLoading: authLoading.value })
  }
}

// Beim Mount und wenn sich der Auth-Status ändert
onMounted(() => {
  loadData()
})

watch([user, authLoading], () => {
  loadData()
}, { immediate: true })

// Basis Chart Optionen - dynamisch basierend auf Theme
const baseChartOptions = computed((): ApexOptions => ({
  chart: {
    type: 'line' as const,
    height: 250, // Reduced height for desktop
    background: 'transparent',
    animations: {
      enabled: true,
      speed: 800
    },
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: false,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: false,
        reset: true
      }
    }
  },
  theme: {
    mode: isDark.value ? 'dark' : 'light'
  },
  stroke: {
    curve: 'smooth' as const,
    width: 3
  },
  grid: {
    show: true,
    borderColor: isDark.value ? '#444' : '#e0e0e0',
    strokeDashArray: 3
  },
  markers: {
    size: 6,
    colors: [isDark.value ? '#2a2a2a' : '#fff'],
    strokeWidth: 2,
    hover: {
      size: 8
    }
  },
  tooltip: {
    enabled: true,
    shared: true,
    intersect: false,
    x: {
      format: 'dd.MM.yyyy'
    },
    theme: isDark.value ? 'dark' : 'light'
  },
  xaxis: {
    type: 'datetime' as const,
    labels: {
      format: 'dd.MM',
      style: {
        fontSize: '12px',
        colors: isDark.value ? 'rgba(255, 255, 255, 0.75)' : '#666'
      }
    },
    axisBorder: {
      color: isDark.value ? '#444' : '#e0e0e0'
    },
    axisTicks: {
      color: isDark.value ? '#444' : '#e0e0e0'
    }
  },
  yaxis: {
    labels: {
      style: {
        colors: isDark.value ? 'rgba(255, 255, 255, 0.75)' : '#666'
      }
    }
  },
  legend: {
    show: false
  }
}))

// Gewicht Chart Konfiguration
const gewichtChartOptions = computed(() => ({
  ...baseChartOptions.value,
  colors: ['#FF6B6B'],
  yaxis: {
    title: {
      text: 'Gewicht (kg)',
      style: {
        fontSize: '14px',
        fontWeight: '600',
        color: isDark.value ? 'rgba(255, 255, 255, 0.9)' : '#333'
      }
    },
    labels: {
      formatter: (value: number) => `${value} kg`,
      style: {
        colors: isDark.value ? 'rgba(255, 255, 255, 0.75)' : '#666'
      }
    }
  },
  title: {
    text: '',
    align: 'center' as const,
    style: {
      fontSize: '16px',
      fontWeight: '600',
      color: isDark.value ? 'rgba(255, 255, 255, 0.9)' : '#333'
    }
  }
}))

const gewichtSeries = computed(() => [
  {
    name: 'Gewicht',
    data: werte.value
      .slice()
      .filter(w => w.wert_gewicht != null && w.wert_gewicht > 0) // NULL und 0 ausfiltern
      .sort((a, b) => new Date(a.wert_datum).getTime() - new Date(b.wert_datum).getTime())
      .map(w => ({
        x: new Date(w.wert_datum).getTime(),
        y: w.wert_gewicht
      }))
  }
])

// Taille Chart Konfiguration
const tailleChartOptions = computed(() => ({
  ...baseChartOptions.value,
  colors: ['#4ECDC4'],
  yaxis: {
    title: {
      text: 'Taille (cm)',
      style: {
        fontSize: '14px',
        fontWeight: '600',
        color: isDark.value ? 'rgba(255, 255, 255, 0.9)' : '#333'
      }
    },
    labels: {
      formatter: (value: number) => `${value} cm`,
      style: {
        colors: isDark.value ? 'rgba(255, 255, 255, 0.75)' : '#666'
      }
    }
  },
  title: {
    text: '',
    align: 'center' as const,
    style: {
      fontSize: '16px',
      fontWeight: '600',
      color: isDark.value ? 'rgba(255, 255, 255, 0.9)' : '#333'
    }
  }
}))

const tailleSeries = computed(() => [
  {
    name: 'Taille',
    data: werte.value
      .slice()
      .filter(w => w.wert_taille != null && w.wert_taille > 0) // NULL und 0 ausfiltern
      .sort((a, b) => new Date(a.wert_datum).getTime() - new Date(b.wert_datum).getTime())
      .map(w => ({
        x: new Date(w.wert_datum).getTime(),
        y: w.wert_taille
      }))
  }
])

// Bauch Chart Konfiguration
const bauchChartOptions = computed(() => ({
  ...baseChartOptions.value,
  colors: ['#45B7D1'],
  yaxis: {
    title: {
      text: 'Bauch (cm)',
      style: {
        fontSize: '14px',
        fontWeight: '600',
        color: isDark.value ? 'rgba(255, 255, 255, 0.9)' : '#333'
      }
    },
    labels: {
      formatter: (value: number) => `${value} cm`,
      style: {
        colors: isDark.value ? 'rgba(255, 255, 255, 0.75)' : '#666'
      }
    }
  },
  title: {
    text: 'Bauchverlauf',
    align: 'center' as const,
    style: {
      fontSize: '16px',
      fontWeight: '600',
      color: isDark.value ? 'rgba(255, 255, 255, 0.9)' : '#333'
    }
  }
}))

const bauchSeries = computed(() => [
  {
    name: 'Bauch',
    data: werte.value
      .slice()
      .filter(w => w.wert_bauch != null && w.wert_bauch > 0) // NULL und 0 ausfiltern
      .sort((a, b) => new Date(a.wert_datum).getTime() - new Date(b.wert_datum).getTime())
      .map(w => ({
        x: new Date(w.wert_datum).getTime(),
        y: w.wert_bauch
      }))
  }
])

// Po Chart Konfiguration
const poChartOptions = computed(() => ({
  ...baseChartOptions.value,
  colors: ['#96CEB4'],
  yaxis: {
    title: {
      text: 'Po (cm)',
      style: {
        fontSize: '14px',
        fontWeight: '600',
        color: isDark.value ? 'rgba(255, 255, 255, 0.9)' : '#333'
      }
    },
    labels: {
      formatter: (value: number) => `${value} cm`,
      style: {
        colors: isDark.value ? 'rgba(255, 255, 255, 0.75)' : '#666'
      }
    }
  },
  title: {
    text: '',
    align: 'center' as const,
    style: {
      fontSize: '16px',
      fontWeight: '600',
      color: isDark.value ? 'rgba(255, 255, 255, 0.9)' : '#333'
    }
  }
}))

const poSeries = computed(() => [
  {
    name: 'Po',
    data: werte.value
      .slice()
      .filter(w => w.wert_po != null && w.wert_po > 0) // NULL und 0 ausfiltern
      .sort((a, b) => new Date(a.wert_datum).getTime() - new Date(b.wert_datum).getTime())
      .map(w => ({
        x: new Date(w.wert_datum).getTime(),
        y: w.wert_po
      }))
  }
])

// Oberschenkel Chart Konfiguration
const oberschenkelChartOptions = computed(() => ({
  ...baseChartOptions.value,
  colors: ['#FECA57'],
  yaxis: {
    title: {
      text: 'Oberschenkel (cm)',
      style: {
        fontSize: '14px',
        fontWeight: '600',
        color: isDark.value ? 'rgba(255, 255, 255, 0.9)' : '#333'
      }
    },
    labels: {
      formatter: (value: number) => `${value} cm`,
      style: {
        colors: isDark.value ? 'rgba(255, 255, 255, 0.75)' : '#666'
      }
    }
  },
  title: {
    text: '',
    align: 'center' as const,
    style: {
      fontSize: '16px',
      fontWeight: '600',
      color: isDark.value ? 'rgba(255, 255, 255, 0.9)' : '#333'
    }
  }
}))

const oberschenkelSeries = computed(() => [
  {
    name: 'Oberschenkel',
    data: werte.value
      .slice()
      .filter(w => w.wert_oberschenkel != null && w.wert_oberschenkel > 0) // NULL und 0 ausfiltern
      .sort((a, b) => new Date(a.wert_datum).getTime() - new Date(b.wert_datum).getTime())
      .map(w => ({
        x: new Date(w.wert_datum).getTime(),
        y: w.wert_oberschenkel
      }))
  }
])

// Computed Properties für Chart-Verfügbarkeit
const hasGewichtData = computed(() => (gewichtSeries.value[0]?.data?.length || 0) > 0)
const hasTailleData = computed(() => (tailleSeries.value[0]?.data?.length || 0) > 0)
const hasBauchData = computed(() => (bauchSeries.value[0]?.data?.length || 0) > 0)
const hasPoData = computed(() => (poSeries.value[0]?.data?.length || 0) > 0)
const hasOberschenkelData = computed(() => (oberschenkelSeries.value[0]?.data?.length || 0) > 0)

const hasAnyChartData = computed(() =>
  hasGewichtData.value || hasTailleData.value || hasBauchData.value || hasPoData.value || hasOberschenkelData.value
)
</script>

<style scoped>
.charts-container {
  padding: 20px;
}

/* Desktop layout optimization */
@media (min-width: 768px) {
  .charts-container {
    padding: 15px;
  }

  .charts-container h2 {
    font-size: 20px;
    margin-bottom: 20px;
  }
}

.charts-container h2 {
  text-align: center;
  margin-bottom: 30px;
  color: var(--text-primary);
  font-size: 24px;
}

.loading, .error, .no-data {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  border-radius: 8px;
  margin: 20px 0;
}

.loading {
  background-color: #f0f8ff;
  color: #0066cc;
  border: 1px solid #b3d9ff;
}

.error {
  background-color: #fff5f5;
  color: #d63031;
  border: 1px solid #fbb6b9;
}

.no-data {
  background-color: #fffbf0;
  color: #b7791f;
  border: 1px solid #f6d55c;
}

.no-data-container {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  border-radius: 8px;
  margin: 20px 0;
  background-color: #fffbf0;
  color: #b7791f;
  border: 1px solid #f6d55c;
}

.no-data-container p {
  margin-bottom: 20px;
}

.reload-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background-color: var(--primary-color, #007bff);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.reload-button:hover:not(:disabled) {
  background-color: var(--primary-color-dark, #0056b3);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.reload-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.reload-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.reload-icon {
  transition: transform 0.3s ease;
}

.reload-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

/* Desktop-optimized layout */
@media (min-width: 768px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
}

@media (min-width: 1200px) {
  .charts-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }
}

.chart-item {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px var(--shadow);
  border: 1px solid var(--border-color);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease, border-color 0.3s ease;
}

/* Desktop-specific chart styling */
@media (min-width: 768px) {
  .chart-item {
    padding: 12px;
    border-radius: 6px;
  }

  .chart-item h3 {
    font-size: 16px;
    margin-bottom: 10px;
  }
}

.chart-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px var(--shadow);
}

.chart-item h3 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

/* Die CSS-Variablen werden automatisch durch das Theme-System aktualisiert */
</style>
