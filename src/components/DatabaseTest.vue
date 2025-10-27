<template>
  <div class="db-test">
    <h2>Datenbankverbindung Test</h2>

    <!-- Connection Test -->
    <div class="test-section">
      <h3>Verbindungstest</h3>
      <button @click="testConnection" :disabled="loading">
        {{ loading ? 'Teste...' : 'Verbindung testen' }}
      </button>
      <div v-if="connectionStatus" :class="connectionStatus.success ? 'success' : 'error'">
        {{ connectionStatus.message }}
      </div>
    </div>

    <!-- Werte Test -->
    <div class="test-section" v-if="user">
      <h3>Werte testen</h3>
      <button @click="testWerte" :disabled="werteLoading">
        {{ werteLoading ? 'Teste...' : 'Werte laden' }}
      </button>

      <div v-if="werteError" class="error">
        Fehler: {{ werteError }}
      </div>

      <div v-if="werte.length > 0" class="data-display">
        <h4>Gefundene Werte ({{ werte.length }}):</h4>
        <div v-for="wert in werte.slice(0, 3)" :key="wert.id" class="data-item">
          <strong>{{ wert.wert_datum }}</strong> -
          Gewicht: {{ wert.wert_gewicht }}kg,
          Taille: {{ wert.wert_taille }}cm
        </div>
      </div>

      <!-- Test-Wert hinzufügen -->
      <div class="add-test-data">
        <h4>Test-Wert hinzufügen</h4>
        <form @submit.prevent="addTestWert">
          <input
            v-model="testWert.wert_datum"
            type="date"
            required
            placeholder="Datum"
          >
          <input
            v-model.number="testWert.wert_gewicht"
            type="number"
            step="0.1"
            required
            placeholder="Gewicht (kg)"
          >
          <input
            v-model.number="testWert.wert_taille"
            type="number"
            step="0.1"
            required
            placeholder="Taille (cm)"
          >
          <input
            v-model.number="testWert.wert_bauch"
            type="number"
            step="0.1"
            required
            placeholder="Bauch (cm)"
          >
          <input
            v-model.number="testWert.wert_po"
            type="number"
            step="0.1"
            required
            placeholder="Po (cm)"
          >
          <input
            v-model.number="testWert.wert_oberschenkel"
            type="number"
            step="0.1"
            required
            placeholder="Oberschenkel (cm)"
          >
          <button type="submit" :disabled="werteLoading">
            Hinzufügen
          </button>
        </form>
      </div>
    </div>

    <!-- Wochenplan Test -->
    <div class="test-section" v-if="user">
      <h3>Wochenplan testen</h3>
      <button @click="testWochenplan" :disabled="planLoading">
        {{ planLoading ? 'Teste...' : 'Wochenplan laden' }}
      </button>

      <div v-if="planError" class="error">
        Fehler: {{ planError }}
      </div>

      <div v-if="wochenplaene.length > 0" class="data-display">
        <h4>Gefundene Wochenpläne ({{ wochenplaene.length }}):</h4>
        <div v-for="plan in wochenplaene.slice(0, 3)" :key="plan.id" class="data-item">
          <strong>{{ plan.plan_datum }}</strong><br>
          Früh: {{ plan.plan_frueh }}<br>
          Mittag: {{ plan.plan_mittag }}<br>
          Abend: {{ plan.plan_abend }}
        </div>
      </div>
    </div>

    <!-- Auth Status -->
    <div class="test-section">
      <h3>Authentifizierung</h3>
      <div v-if="user" class="success">
        Angemeldet als: {{ user.email }}
      </div>
      <div v-else class="error">
        Nicht angemeldet
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useAuth } from '../composables/useAuth'
import { useWerte } from '../composables/useWerte'
import { useWochenplan } from '../composables/useWochenplan'

const { user } = useAuth()

// Connection Test
const loading = ref(false)
const connectionStatus = ref<{success: boolean, message: string} | null>(null)

const testConnection = async () => {
  loading.value = true
  connectionStatus.value = null

  try {
    const { error } = await supabase
      .from('werte')
      .select('count')
      .limit(1)

    if (error) throw error

    connectionStatus.value = {
      success: true,
      message: 'Datenbankverbindung erfolgreich!'
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler'
    connectionStatus.value = {
      success: false,
      message: `Verbindungsfehler: ${errorMessage}`
    }
  } finally {
    loading.value = false
  }
}

// Werte Test
const {
  werte,
  loading: werteLoading,
  error: werteError,
  fetchWerte,
  addWert
} = useWerte()

const testWert = ref({
  wert_datum: new Date().toISOString().split('T')[0] as string,
  wert_gewicht: 70,
  wert_taille: 75,
  wert_bauch: 80,
  wert_po: 95,
  wert_oberschenkel: 55
})

const testWerte = async () => {
  await fetchWerte()
}

const addTestWert = async () => {
  if (!testWert.value.wert_datum) return

  const result = await addWert(testWert.value as {
    wert_datum: string
    wert_gewicht: number
    wert_taille: number
    wert_bauch: number
    wert_po: number
    wert_oberschenkel: number
  })
  if (result) {
    // Reset form
    testWert.value = {
      wert_datum: new Date().toISOString().split('T')[0] as string,
      wert_gewicht: 70,
      wert_taille: 75,
      wert_bauch: 80,
      wert_po: 95,
      wert_oberschenkel: 55
    }
  }
}

// Wochenplan Test
const {
  wochenplaene,
  loading: planLoading,
  error: planError,
  fetchWochenplaene
} = useWochenplan()

const testWochenplan = async () => {
  await fetchWochenplaene()
}

onMounted(() => {
  testConnection()
})
</script>

<style scoped>
.db-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.test-section h3 {
  margin-top: 0;
  color: #333;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin: 10px 5px 10px 0;
}

button:hover:not(:disabled) {
  background: #0056b3;
}

button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.success {
  color: #28a745;
  padding: 10px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  margin: 10px 0;
}

.error {
  color: #dc3545;
  padding: 10px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin: 10px 0;
}

.data-display {
  margin: 15px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.data-item {
  margin: 10px 0;
  padding: 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.add-test-data {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.add-test-data form {
  display: grid;
  gap: 10px;
  max-width: 300px;
}

.add-test-data input {
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}
</style>
