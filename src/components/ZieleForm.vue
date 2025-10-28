<template>
  <div class="ziele-form-overlay" @click="$emit('close')">
    <div class="ziele-form-modal" @click.stop>
      <div class="modal-header">
        <h3>Ziele definieren</h3>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>

      <div class="modal-content">
        <!-- Debug Info -->
        <div class="debug-info" style="background: #f0f0f0; padding: 10px; margin-bottom: 1rem; border-radius: 4px;">
          <small>
            Debug: Loading: {{ loading }} |
            Ziele count: {{ ziele.length }} |
            Error: {{ error || 'None' }}
          </small>
        </div>

        <!-- Hauptziel Sektion -->
        <div class="ziel-section">
          <h4>Hauptziel (Endgewicht)</h4>
          <div v-if="hauptziel && !editingHauptziel" class="existing-ziel hauptziel">
            <div class="ziel-info">
              <span class="ziel-gewicht">{{ hauptziel.ziel_ziel }} kg</span>
              <span class="ziel-datum">bis {{ formatDate(hauptziel.ziel_datum) }}</span>
            </div>
            <div class="ziel-actions">
              <button @click="startEditHauptziel" class="edit-btn" :disabled="loading">
                ✏️
              </button>
              <button @click="deleteZiel(hauptziel.id)" class="delete-btn" :disabled="loading">
                🗑️
              </button>
            </div>
          </div>
          <div v-else-if="editingHauptziel" class="ziel-form editing">
            <div class="form-group">
              <label>Zielgewicht (kg):</label>
              <input
                v-model.number="hauptzielEditForm.gewicht"
                type="number"
                step="0.1"
                placeholder="z.B. 70"
              />
            </div>
            <div class="form-group">
              <label>Bis wann:</label>
              <input
                v-model="hauptzielEditForm.datum"
                type="date"
              />
            </div>
            <div class="form-actions">
              <button
                @click="saveHauptziel"
                :disabled="!isHauptzielEditValid || loading"
                class="save-btn"
              >
                Speichern
              </button>
              <button @click="cancelEditHauptziel" class="cancel-btn">
                Abbrechen
              </button>
            </div>
          </div>
          <div v-else class="ziel-form">
            <div class="form-group">
              <label>Zielgewicht (kg):</label>
              <input
                v-model.number="hauptzielForm.gewicht"
                type="number"
                step="0.1"
                placeholder="z.B. 70"
              />
            </div>
            <div class="form-group">
              <label>Bis wann:</label>
              <input
                v-model="hauptzielForm.datum"
                type="date"
              />
            </div>
            <button
              @click="addHauptziel"
              :disabled="!isHauptzielValid || loading"
              class="add-btn"
            >
              Hauptziel hinzufügen
            </button>
          </div>
        </div>

        <!-- Zwischenziele Sektion -->
        <div class="ziel-section">
          <div class="section-header">
            <h4>Zwischenziele</h4>
            <button @click="addZwischenzielForm" class="add-icon-btn">+</button>
          </div>

          <!-- Bestehende Zwischenziele -->
          <div v-for="ziel in zwischenziele" :key="ziel.id">
            <div v-if="editingZwischenziel !== ziel.id" class="existing-ziel zwischenziel">
              <div class="ziel-info">
                <span class="ziel-gewicht">{{ ziel.ziel_ziel }} kg</span>
                <span class="ziel-datum">bis {{ formatDate(ziel.ziel_datum) }}</span>
              </div>
              <div class="ziel-actions">
                <button @click="startEditZwischenziel(ziel)" class="edit-btn" :disabled="loading">
                  ✏️
                </button>
                <button @click="deleteZiel(ziel.id)" class="delete-btn" :disabled="loading">
                  🗑️
                </button>
              </div>
            </div>
            <div v-else class="ziel-form editing">
              <div class="form-group">
                <label>Zielgewicht (kg):</label>
                <input
                  v-model.number="zwischenzielEditForm.gewicht"
                  type="number"
                  step="0.1"
                  placeholder="z.B. 75"
                />
              </div>
              <div class="form-group">
                <label>Bis wann:</label>
                <input
                  v-model="zwischenzielEditForm.datum"
                  type="date"
                />
              </div>
              <div class="form-actions">
                <button
                  @click="saveZwischenziel"
                  :disabled="!isZwischenzielEditValid || loading"
                  class="save-btn"
                >
                  Speichern
                </button>
                <button @click="cancelEditZwischenziel" class="cancel-btn">
                  Abbrechen
                </button>
              </div>
            </div>
          </div>

          <!-- Neue Zwischenziele Formulare -->
          <div v-for="(form, index) in zwischenzielForms" :key="index" class="ziel-form">
            <div class="form-group">
              <label>Zielgewicht (kg):</label>
              <input
                v-model.number="form.gewicht"
                type="number"
                step="0.1"
                placeholder="z.B. 75"
              />
            </div>
            <div class="form-group">
              <label>Bis wann:</label>
              <input
                v-model="form.datum"
                type="date"
              />
            </div>
            <div class="form-actions">
              <button
                @click="addZwischenziel(index)"
                :disabled="!isZwischenzielValid(form) || loading"
                class="add-btn small"
              >
                Hinzufügen
              </button>
              <button @click="removeZwischenzielForm(index)" class="remove-btn small">
                Entfernen
              </button>
            </div>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn secondary">Schließen</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useZiele } from '../composables/useZiele'
import type { Ziele } from '../types/database'

defineEmits<{
  close: []
}>()

const {
  ziele,
  hauptziel,
  zwischenziele,
  loading,
  error,
  fetchZiele,
  addZiel,
  deleteZiel: deleteZielComposable,
  updateZiel
} = useZiele()

// Hauptziel Formular
const hauptzielForm = ref({
  gewicht: null as number | null,
  datum: ''
})

// Hauptziel Bearbeitung
const editingHauptziel = ref(false)
const hauptzielEditForm = ref({
  gewicht: null as number | null,
  datum: ''
})

// Zwischenziele Formulare
const zwischenzielForms = ref<Array<{ gewicht: number | null, datum: string }>>([])

// Zwischenziel Bearbeitung
const editingZwischenziel = ref<number | null>(null)
const zwischenzielEditForm = ref({
  gewicht: null as number | null,
  datum: ''
})

const isHauptzielValid = computed(() =>
  hauptzielForm.value.gewicht &&
  hauptzielForm.value.gewicht > 0 &&
  hauptzielForm.value.datum
)

const isHauptzielEditValid = computed(() =>
  hauptzielEditForm.value.gewicht &&
  hauptzielEditForm.value.gewicht > 0 &&
  hauptzielEditForm.value.datum
)

const isZwischenzielValid = (form: { gewicht: number | null, datum: string }) =>
  form.gewicht && form.gewicht > 0 && form.datum

const isZwischenzielEditValid = computed(() =>
  zwischenzielEditForm.value.gewicht &&
  zwischenzielEditForm.value.gewicht > 0 &&
  zwischenzielEditForm.value.datum
)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('de-DE')
}

const addHauptziel = async () => {
  if (!isHauptzielValid.value) return

  try {
    await addZiel({
      ziel_typ: 2,
      ziel_ziel: hauptzielForm.value.gewicht!,
      ziel_datum: hauptzielForm.value.datum
    })
    // Form zurücksetzen
    hauptzielForm.value = { gewicht: null, datum: '' }
  } catch (err) {
    console.error('Fehler beim Hinzufügen des Hauptziels:', err)
  }
}

const addZwischenzielForm = () => {
  zwischenzielForms.value.push({ gewicht: null, datum: '' })
}

const removeZwischenzielForm = (index: number) => {
  zwischenzielForms.value.splice(index, 1)
}

const addZwischenziel = async (index: number) => {
  const form = zwischenzielForms.value[index]
  if (!form || !isZwischenzielValid(form)) return

  try {
    await addZiel({
      ziel_typ: 1,
      ziel_ziel: form.gewicht!,
      ziel_datum: form.datum
    })
    // Form entfernen nach erfolgreichem Hinzufügen
    zwischenzielForms.value.splice(index, 1)
  } catch (err) {
    console.error('Fehler beim Hinzufügen des Zwischenziels:', err)
  }
}

const deleteZiel = async (id: number) => {
  try {
    await deleteZielComposable(id)
  } catch (err) {
    console.error('Fehler beim Löschen des Ziels:', err)
  }
}

// Hauptziel Bearbeitungsfunktionen
const startEditHauptziel = () => {
  if (!hauptziel.value) return
  editingHauptziel.value = true
  hauptzielEditForm.value = {
    gewicht: hauptziel.value.ziel_ziel,
    datum: hauptziel.value.ziel_datum
  }
}

const saveHauptziel = async () => {
  if (!hauptziel.value || !isHauptzielEditValid.value) return

  try {
    await updateZiel(hauptziel.value.id, {
      ziel_ziel: hauptzielEditForm.value.gewicht!,
      ziel_datum: hauptzielEditForm.value.datum
    })
    editingHauptziel.value = false
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Hauptziels:', err)
  }
}

const cancelEditHauptziel = () => {
  editingHauptziel.value = false
  hauptzielEditForm.value = { gewicht: null, datum: '' }
}

// Zwischenziel Bearbeitungsfunktionen
const startEditZwischenziel = (ziel: Ziele) => {
  editingZwischenziel.value = ziel.id
  zwischenzielEditForm.value = {
    gewicht: ziel.ziel_ziel,
    datum: ziel.ziel_datum
  }
}

const saveZwischenziel = async () => {
  if (!editingZwischenziel.value || !isZwischenzielEditValid.value) return

  try {
    await updateZiel(editingZwischenziel.value, {
      ziel_ziel: zwischenzielEditForm.value.gewicht!,
      ziel_datum: zwischenzielEditForm.value.datum
    })
    editingZwischenziel.value = null
    zwischenzielEditForm.value = { gewicht: null, datum: '' }
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Zwischenziels:', err)
  }
}

const cancelEditZwischenziel = () => {
  editingZwischenziel.value = null
  zwischenzielEditForm.value = { gewicht: null, datum: '' }
}

onMounted(() => {
  console.log('ZieleForm: Component mounted, fetching ziele')
  fetchZiele()
})
</script>

<style scoped>
.ziele-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.ziele-form-modal {
  background: var(--bg-primary);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-content {
  padding: 1.5rem;
}

.ziel-section {
  margin-bottom: 2rem;
}

.ziel-section h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.add-icon-btn {
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon-btn:hover {
  background: var(--accent-primary-hover);
}

.existing-ziel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  border: 2px solid var(--border-color);
}

.hauptziel {
  border-color: var(--accent-primary);
  background: var(--success-bg);
}

.zwischenziel {
  border-color: var(--accent-secondary);
  background: var(--bg-tertiary);
}

.ziel-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ziel-gewicht {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.ziel-datum {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.ziel-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn {
  background: var(--accent-secondary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.edit-btn:hover {
  background: var(--accent-secondary-hover);
}

.delete-btn {
  background: var(--error);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.delete-btn:hover {
  background: var(--error-border);
}

.ziel-form {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 1rem;
  background: var(--bg-secondary);
}

.ziel-form.editing {
  border-color: var(--accent-primary);
  background: var(--bg-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.add-btn {
  background: var(--accent-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.add-btn:hover:not(:disabled) {
  background: var(--accent-primary-hover);
}

.add-btn:disabled {
  background: var(--text-muted);
  cursor: not-allowed;
}

.add-btn.small {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.remove-btn {
  background: var(--error);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.remove-btn:hover {
  background: var(--error-border);
}

.save-btn {
  background: var(--success);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.save-btn:hover:not(:disabled) {
  background: var(--success-hover);
}

.save-btn:disabled {
  background: var(--text-muted);
  cursor: not-allowed;
}

.cancel-btn {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn:hover {
  background: var(--bg-secondary);
}

.error-message {
  padding: 0.75rem;
  background: var(--error-bg);
  color: var(--error);
  border-radius: 4px;
  margin-top: 1rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn.secondary:hover {
  background: var(--bg-tertiary);
}

@media (max-width: 768px) {
  .ziele-form-modal {
    width: 95%;
    margin: 1rem;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-content {
    padding: 1rem;
  }

  .existing-ziel {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .ziel-actions {
    align-self: stretch;
    justify-content: flex-end;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
