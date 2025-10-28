<template>
    <div class="werte-form">
    <div class="form-header" @click="toggleCollapse">
      <h3>Neue Messwerte hinzufügen</h3>
      <span class="collapse-icon" :class="{ 'collapsed': isCollapsed }">▼</span>
    </div>

    <div v-if="!isAuthenticated" class="error-message">
      Sie müssen angemeldet sein, um Messwerte hinzuzufügen.
    </div>

    <div class="form-content" :class="{ 'collapsed': isCollapsed }">
      <form @submit.prevent="submitForm">
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
          class="form-input"
          placeholder="z.B. 75.5 (optional)"
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
          class="form-input"
          placeholder="z.B. 85.0 (optional)"
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
          class="form-input"
          placeholder="z.B. 90.5 (optional)"
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
          class="form-input"
          placeholder="z.B. 100.0 (optional)"
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
          class="form-input"
          placeholder="z.B. 55.5 (optional)"
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
      </form>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <!-- Gratulations-Feuerwerk -->
    <div v-if="showCelebration" class="celebration-container">
      <div class="celebration-content">
        <div class="fireworks-icon">🎉</div>
        <div class="celebration-text">
          <h2>Super, gratuliere!!! Du bist spitze!</h2>
          <p>{{ celebrationMessage }}</p>
        </div>
        <div class="fireworks-icon">🎆</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useWerte } from '../composables/useWerte'
import { useAuthStore } from '../stores/auth'


const { user } = useAuthStore()
const { loading, addWert } = useWerte()

const isAuthenticated = computed(() => !!user.value)

const successMessage = ref<string | null>(null)
const showCelebration = ref(false)
const celebrationMessage = ref('')
const error = ref<string | null>(null)

// Zustand für das Ein-/Ausklappen
const isCollapsed = ref(true)

// Heute als Standarddatum
const today = new Date().toISOString().split('T')[0]

const formData = reactive({
  wert_datum: today as string,
  wert_gewicht: null as number | null,
  wert_taille: null as number | null,
  wert_bauch: null as number | null,
  wert_po: null as number | null,
  wert_oberschenkel: null as number | null
})

const resetForm = () => {
  const currentDate = new Date().toISOString().split('T')[0] as string
  formData.wert_datum = currentDate
  formData.wert_gewicht = null
  formData.wert_taille = null
  formData.wert_bauch = null
  formData.wert_po = null
  formData.wert_oberschenkel = null
  successMessage.value = null
  showCelebration.value = false
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const submitForm = async () => {
  if (!isAuthenticated.value) {
    return
  }

  // Fehler und Erfolg zurücksetzen
  error.value = null
  successMessage.value = null

  // Validierung: Datum ist erforderlich und mindestens ein Messwert muss eingegeben werden
  if (!formData.wert_datum) {
    error.value = 'Bitte geben Sie ein Datum ein.'
    return
  }

  // Prüfen ob mindestens ein Messwert eingegeben wurde
  const hasAtLeastOneValue = (
    (formData.wert_gewicht !== null && formData.wert_gewicht > 0) ||
    (formData.wert_taille !== null && formData.wert_taille > 0) ||
    (formData.wert_bauch !== null && formData.wert_bauch > 0) ||
    (formData.wert_po !== null && formData.wert_po > 0) ||
    (formData.wert_oberschenkel !== null && formData.wert_oberschenkel > 0)
  )

  if (!hasAtLeastOneValue) {
    error.value = 'Bitte geben Sie mindestens einen Messwert ein.'
    return
  }

  // Validieren, dass eingegebene Werte positiv sind
  if ((formData.wert_gewicht !== null && formData.wert_gewicht <= 0) ||
      (formData.wert_taille !== null && formData.wert_taille <= 0) ||
      (formData.wert_bauch !== null && formData.wert_bauch <= 0) ||
      (formData.wert_po !== null && formData.wert_po <= 0) ||
      (formData.wert_oberschenkel !== null && formData.wert_oberschenkel <= 0)) {
    error.value = 'Alle eingegebenen Messwerte müssen größer als 0 sein.'
    return
  }

  try {
    // Transformiere null-Werte zu 0 für die Datenbank
    const dataToSend = {
      wert_datum: formData.wert_datum,
      wert_gewicht: formData.wert_gewicht || 0,
      wert_taille: formData.wert_taille || 0,
      wert_bauch: formData.wert_bauch || 0,
      wert_po: formData.wert_po || 0,
      wert_oberschenkel: formData.wert_oberschenkel || 0
    }

    const result = await addWert(dataToSend)

    if (result) {
      if (result.zielErreicht) {
        // Zeige Feuerwerk-Gratulation
        showCelebration.value = true
        celebrationMessage.value = result.zielText
        successMessage.value = 'Super, gratuliere!!! Du bist spitze!'

        // Verstecke die Gratulation nach 5 Sekunden
        setTimeout(() => {
          showCelebration.value = false
        }, 5000)
      } else {
        successMessage.value = 'Werte erfolgreich gespeichert!'
      }

      // Form nach erfolgreichem Speichern zurücksetzen
      setTimeout(() => {
        resetForm()
      }, 3000)
    }
  } catch (err) {
    console.error('Fehler beim Speichern:', err)
  }
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

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 8px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.form-header:hover {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 8px 12px;
  margin: -8px -12px 20px -12px;
}

.werte-form h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.collapse-icon {
  font-size: 14px;
  color: #666;
  transition: transform 0.3s ease;
}

.collapse-icon.collapsed {
  transform: rotate(-90deg);
}

.form-content {
  overflow: hidden;
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
  max-height: 1000px;
  opacity: 1;
}

.form-content.collapsed {
  max-height: 0;
  opacity: 0;
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

.celebration-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: celebrationFade 0.5s ease-in;
}

.celebration-content {
  background: linear-gradient(135deg, #4ECDC4 0%, #44a08d 100%);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  animation: celebrationBounce 0.6s ease-out 0.2s both;
}

.fireworks-icon {
  font-size: 60px;
  margin: 10px;
  animation: fireworksRotate 2s infinite;
  display: inline-block;
}

.celebration-text h2 {
  font-size: 28px;
  font-weight: bold;
  margin: 20px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.celebration-text p {
  font-size: 18px;
  margin: 10px 0;
  opacity: 0.9;
}

@keyframes celebrationFade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes celebrationBounce {
  0% {
    transform: scale(0.3) translateY(-100px);
    opacity: 0;
  }
  50% {
    transform: scale(1.05) translateY(0);
  }
  70% {
    transform: scale(0.95) translateY(0);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes fireworksRotate {
  0% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(90deg) scale(1.2);
  }
  50% {
    transform: rotate(180deg) scale(1);
  }
  75% {
    transform: rotate(270deg) scale(1.2);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
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

  .form-header {
    border-bottom-color: #555;
  }

  .form-header:hover {
    background-color: #3a3a3a;
  }

  .collapse-icon {
    color: #ccc;
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

  .celebration-container {
    background-color: rgba(0, 0, 0, 0.9);
  }

  .celebration-content {
    background: linear-gradient(135deg, #2a5a5a 0%, #1a4a4a 100%);
    color: #fff;
  }
}
</style>
