<template>
    <div class="werte-form">
    <h3>Neue Messwerte hinzufügen</h3>

    <div v-if="!isAuthenticated" class="error-message">
      Sie müssen angemeldet sein, um Messwerte hinzuzufügen.
    </div>

      <div class="form-group">
        <label for="datum">Datum:</label>
        <input
          id="datum"
          v-model="formData.wert_datum"
          type="date"
          required
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="gewicht">Gewicht (kg):</label>
        <input
          id="gewicht"
          v-model.number="formData.wert_gewicht"
          type="number"
          step="0.1"
          min="0"
          required
          class="form-input"
          placeholder="z.B. 75.5"
        />
      </div>

      <div class="form-group">
        <label for="taille">Taille (cm):</label>
        <input
          id="taille"
          v-model.number="formData.wert_taille"
          type="number"
          step="0.1"
          min="0"
          required
          class="form-input"
          placeholder="z.B. 85.0"
        />
      </div>

      <div class="form-group">
        <label for="bauch">Bauch (cm):</label>
        <input
          id="bauch"
          v-model.number="formData.wert_bauch"
          type="number"
          step="0.1"
          min="0"
          required
          class="form-input"
          placeholder="z.B. 90.5"
        />
      </div>

      <div class="form-group">
        <label for="po">Po (cm):</label>
        <input
          id="po"
          v-model.number="formData.wert_po"
          type="number"
          step="0.1"
          min="0"
          required
          class="form-input"
          placeholder="z.B. 100.0"
        />
      </div>

      <div class="form-group">
        <label for="oberschenkel">Oberschenkel (cm):</label>
        <input
          id="oberschenkel"
          v-model.number="formData.wert_oberschenkel"
          type="number"
          step="0.1"
          min="0"
          required
          class="form-input"
          placeholder="z.B. 55.5"
        />
      </div>

      <div class="form-actions">
        <button
          type="submit"
          :disabled="loading"
          class="btn-primary"
        >
          {{ loading ? 'Speichert...' : 'Speichern' }}
        </button>

        <button
          type="button"
          @click="resetForm"
          class="btn-secondary"
        >
          Zurücksetzen
        </button>
      </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useWerte } from '../composables/useWerte'
import { useAuth } from '../composables/useAuth'


const { user } = useAuth()
const { loading, error } = useWerte()

const isAuthenticated = computed(() => !!user.value)

const successMessage = ref<string | null>(null)

// Heute als Standarddatum
const today = new Date().toISOString().split('T')[0]

const formData = reactive({
  wert_datum: today as string,
  wert_gewicht: 0 as number,
  wert_taille: 0 as number,
  wert_bauch: 0 as number,
  wert_po: 0 as number,
  wert_oberschenkel: 0 as number
})

const resetForm = () => {
  const currentDate = new Date().toISOString().split('T')[0] as string
  formData.wert_datum = currentDate
  formData.wert_gewicht = 0
  formData.wert_taille = 0
  formData.wert_bauch = 0
  formData.wert_po = 0
  formData.wert_oberschenkel = 0
  successMessage.value = null
}

</script>

<style scoped>
.werte-form {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  margin-bottom: 30px;
}

/* Desktop-optimized form styling */
@media (min-width: 768px) {
  .werte-form {
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .werte-form h3 {
    font-size: 18px;
    margin-bottom: 15px;
  }
}

.werte-form h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}

.form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* Desktop-optimized form layout */
@media (min-width: 768px) {
  .form {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }
}

@media (min-width: 1024px) {
  .form {
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 4px;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
  font-size: 15px;
}

.form-input {
  padding: 14px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background: white;
  width: 100%;
  box-sizing: border-box;
}

/* Desktop-optimized input styling */
@media (min-width: 768px) {
  .form-input {
    padding: 8px 10px;
    font-size: 14px;
    border-radius: 6px;
  }

  .form-group label {
    font-size: 13px;
    margin-bottom: 4px;
  }
}

.form-input:focus {
  outline: none;
  border-color: #4ECDC4;
  box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.1);
}

.form-input::placeholder {
  color: #999;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 10px;
}

/* Desktop-optimized button styling */
@media (min-width: 768px) {
  .form-actions {
    margin-top: 5px;
  }

  .btn-primary,
  .btn-secondary {
    padding: 8px 16px;
    font-size: 14px;
    min-width: 100px;
  }
}

.btn-primary {
  background: linear-gradient(135deg, #4ECDC4 0%, #44a08d 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  min-width: 120px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f8f9fa;
  color: #6c757d;
  border: 2px solid #e0e0e0;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.btn-secondary:hover {
  background: #e9ecef;
  border-color: #adb5bd;
  color: #495057;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background-color: #fff5f5;
  color: #d63031;
  border: 1px solid #fbb6b9;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

.success-message {
  margin-top: 16px;
  padding: 12px;
  background-color: #f0fff4;
  color: #00b894;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .werte-form {
    background: #2a2a2a;
    border-color: #444;
    color: #fff;
  }

  .werte-form h3 {
    color: #fff;
  }

  .form-group label {
    color: #ccc;
  }

  .form-input {
    background: #3a3a3a;
    border-color: #555;
    color: #fff;
  }

  .form-input:focus {
    border-color: #4ECDC4;
  }

  .btn-secondary {
    background: #3a3a3a;
    color: #ccc;
    border-color: #555;
  }

  .btn-secondary:hover {
    background: #4a4a4a;
    border-color: #666;
    color: #fff;
  }
}
</style>
