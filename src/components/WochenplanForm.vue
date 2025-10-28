<template>
  <div class="wochenplan-form">
    <div class="form-header" @click="toggleCollapse">
      <h3>Wochenplan verwalten</h3>
      <span class="collapse-icon" :class="{ 'collapsed': isCollapsed }">▼</span>
    </div>

    <div v-if="!isAuthenticated" class="error-message">
      Sie müssen angemeldet sein, um den Wochenplan zu verwalten.
    </div>

    <div class="form-content" :class="{ 'collapsed': isCollapsed }">
      <div v-if="loading" class="loading-message">
        Wochenplan wird geladen...
      </div>

      <div v-else class="week-container">
        <div v-for="day in currentWeekDays" :key="day.datum" class="day-card">
          <div class="day-header">
            <h4>{{ formatDayName(day.datum) }}</h4>
            <span class="day-date">{{ formatDate(day.datum) }}</span>
          </div>

          <div class="meals-container">
            <div class="meal-group">
              <label>Frühstück:</label>
              <div class="meal-input-container">
                <input
                  v-model="day.plan_frueh"
                  type="text"
                  class="form-input meal-input"
                  placeholder="z.B. Haferflocken mit Obst"
                  @input="updatePlan(day.datum, 'plan_frueh', day.plan_frueh)"
                />
                <button
                  type="button"
                  class="drink-btn"
                  @click="setShake(day, 'plan_frueh')"
                  title="Shake hinzufügen"
                >
                  🥤
                </button>
              </div>
            </div>

            <div class="meal-group">
              <label>Mittagessen:</label>
              <div class="meal-input-container">
                <input
                  v-model="day.plan_mittag"
                  type="text"
                  class="form-input meal-input"
                  placeholder="z.B. Salat mit Hähnchen"
                  @input="updatePlan(day.datum, 'plan_mittag', day.plan_mittag)"
                />
                <button
                  type="button"
                  class="drink-btn"
                  @click="setShake(day, 'plan_mittag')"
                  title="Shake hinzufügen"
                >
                  🥤
                </button>
              </div>
            </div>

            <div class="meal-group">
              <label>Abendessen:</label>
              <div class="meal-input-container">
                <input
                  v-model="day.plan_abend"
                  type="text"
                  class="form-input meal-input"
                  placeholder="z.B. Gemüsepfanne"
                  @input="updatePlan(day.datum, 'plan_abend', day.plan_abend)"
                />
                <button
                  type="button"
                  class="drink-btn"
                  @click="setShake(day, 'plan_abend')"
                  title="Shake hinzufügen"
                >
                  🥤
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useWochenplan } from '../composables/useWochenplan'
import { useAuthStore } from '../stores/auth'

const { user } = useAuthStore()
const { loading, fetchWochenplaene, addWochenplan, updateWochenplan } = useWochenplan()

const isAuthenticated = computed(() => !!user.value)
const successMessage = ref<string | null>(null)
const isCollapsed = ref(true)

// Wochentage für die aktuelle Woche generieren
const currentWeekDays = reactive<Array<{
  datum: string
  plan_frueh: string
  plan_mittag: string
  plan_abend: string
  id?: number
}>>([])

const generateWeekDays = () => {
  const today = new Date()
  const weekDays: Array<{
    datum: string
    plan_frueh: string
    plan_mittag: string
    plan_abend: string
    id?: number
  }> = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateString = date.toISOString().split('T')[0] as string

    weekDays.push({
      datum: dateString,
      plan_frueh: '',
      plan_mittag: '',
      plan_abend: ''
    })
  }

  currentWeekDays.splice(0, currentWeekDays.length, ...weekDays)
}

const loadWochenplaene = async () => {
  await fetchWochenplaene()
  // Nach dem Laden der Daten aus der Datenbank die Tage mit vorhandenen Plänen füllen
  const { wochenplaene } = useWochenplan()

  currentWeekDays.forEach(day => {
    const existingPlan = wochenplaene.value.find(plan => plan.plan_datum === day.datum)
    if (existingPlan) {
      day.id = existingPlan.id
      day.plan_frueh = existingPlan.plan_frueh
      day.plan_mittag = existingPlan.plan_mittag
      day.plan_abend = existingPlan.plan_abend
    }
  })
}

const formatDayName = (dateString: string) => {
  const date = new Date(dateString)
  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
  return dayNames[date.getDay()]
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit'
  })
}

const setShake = (day: {
  datum: string
  plan_frueh: string
  plan_mittag: string
  plan_abend: string
  id?: number
}, mealType: 'plan_frueh' | 'plan_mittag' | 'plan_abend') => {
  day[mealType] = 'Shake'
  updatePlan(day.datum, mealType, 'Shake')
}

const updatePlan = async (datum: string, field: 'plan_frueh' | 'plan_mittag' | 'plan_abend', value: string) => {
  if (!isAuthenticated.value) return

  const dayPlan = currentWeekDays.find(d => d.datum === datum)
  if (!dayPlan) return

  try {
    if (dayPlan.id) {
      // Plan existiert bereits, aktualisieren
      await updateWochenplan(dayPlan.id, { [field]: value })
    } else {
      // Neuen Plan erstellen, aber nur wenn mindestens ein Feld ausgefüllt ist
      const hasContent = dayPlan.plan_frueh || dayPlan.plan_mittag || dayPlan.plan_abend
      if (hasContent) {
        const newPlan = await addWochenplan({
          plan_datum: datum,
          plan_frueh: dayPlan.plan_frueh,
          plan_mittag: dayPlan.plan_mittag,
          plan_abend: dayPlan.plan_abend
        })
        if (newPlan) {
          dayPlan.id = newPlan.id
        }
      }
    }

    // Kurze Erfolgsmeldung anzeigen
    successMessage.value = 'Wochenplan gespeichert!'
    setTimeout(() => {
      successMessage.value = null
    }, 2000)
  } catch (err) {
    console.error('Fehler beim Speichern des Wochenplans:', err)
  }
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// Beim Laden der Komponente die Wochentage generieren und vorhandene Pläne laden
onMounted(() => {
  generateWeekDays()
  if (isAuthenticated.value) {
    loadWochenplaene()
  }
})

// Wenn sich der Authentifizierungsstatus ändert
watch(isAuthenticated, (newValue) => {
  if (newValue) {
    loadWochenplaene()
  }
})
</script>

<style scoped>
.wochenplan-form {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  margin-bottom: 30px;
}

/* Desktop-optimized form styling */
@media (min-width: 768px) {
  .wochenplan-form {
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .wochenplan-form h3 {
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

.wochenplan-form h3 {
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
  max-height: 2000px;
  opacity: 1;
}

.form-content.collapsed {
  max-height: 0;
  opacity: 0;
}

.loading-message {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}

.week-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

/* Desktop-optimized week layout */
@media (min-width: 768px) {
  .week-container {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}

@media (min-width: 1200px) {
  .week-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

.day-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #dee2e6;
}

.day-header h4 {
  margin: 0;
  color: #495057;
  font-size: 16px;
  font-weight: 600;
}

.day-date {
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
}

.meals-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meal-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meal-group label {
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.meal-input-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.meal-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background: white;
}

.meal-input:focus {
  outline: none;
  border-color: #4ECDC4;
  box-shadow: 0 0 0 2px rgba(78, 205, 196, 0.1);
}

.meal-input::placeholder {
  color: #999;
}

.drink-btn {
  background: linear-gradient(135deg, #4ECDC4 0%, #44a08d 100%);
  color: white;
  border: none;
  padding: 10px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
}

.drink-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
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
  .wochenplan-form {
    background: #2a2a2a;
    border-color: #444;
    color: #fff;
  }

  .wochenplan-form h3 {
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

  .day-card {
    background: #3a3a3a;
    border-color: #555;
  }

  .day-header {
    border-bottom-color: #555;
  }

  .day-header h4 {
    color: #fff;
  }

  .day-date {
    color: #ccc;
  }

  .meal-group label {
    color: #ccc;
  }

  .meal-input {
    background: #4a4a4a;
    border-color: #666;
    color: #fff;
  }

  .meal-input:focus {
    border-color: #4ECDC4;
  }

  .loading-message {
    color: #ccc;
  }
}
</style>
