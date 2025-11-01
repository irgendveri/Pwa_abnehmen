<script setup lang="ts">
import { ref } from 'vue'
import { useLufu } from '../composables/useLufu'

const { saveLufuData: saveLufuToDatabase, loading: lufuLoading, error: lufuError } = useLufu()

// Lufu-Daten
const lufuData = ref({
  datum: new Date().toISOString().split('T')[0],
  groesse: null as number | null,
  gewicht: null as number | null,
  gesamtergebnis: null as number | null,
  messungKh: false,
  messwerte: [{
    fvc: null as number | null | string,
    fev1: null as number | null | string,
    fev1_fvc: null as number | null | string,
    fef25_75: null as number | null | string,
    mef75: null as number | null | string,
    mef50: null as number | null | string,
    mef25: null as number | null | string,
    pef: null as number | null | string,
    fet: null as number | null | string,
    fivc: null as number | null | string,
    pif: null as number | null | string
  }],
  sollwerte: [{
    fvc: null as number | null | string,
    fev1: null as number | null | string,
    fev1_fvc: null as number | null | string,
    fef25_75: null as number | null | string,
    mef75: null as number | null | string,
    mef50: null as number | null | string,
    mef25: null as number | null | string,
    pef: null as number | null | string,
    fet: null as number | null | string,
    fivc: null as number | null | string,
    pif: null as number | null | string
  }],
  sollProzentWerte: [{
    fvc: null as number | null | string,
    fev1: null as number | null | string,
    fev1_fvc: null as number | null | string,
    fef25_75: null as number | null | string,
    mef75: null as number | null | string,
    mef50: null as number | null | string,
    mef25: null as number | null | string,
    pef: null as number | null | string,
    fet: null as number | null | string,
    fivc: null as number | null | string,
    pif: null as number | null | string
  }],
  ugwWerte: [{
    fvc: null as number | null | string,
    fev1: null as number | null | string,
    fev1_fvc: null as number | null | string,
    fef25_75: null as number | null | string,
    mef75: null as number | null | string,
    mef50: null as number | null | string,
    mef25: null as number | null | string,
    pef: null as number | null | string,
    fet: null as number | null | string,
    fivc: null as number | null | string,
    pif: null as number | null | string
  }]
})

// Lufu-Funktionen
const addMesswert = () => {
  lufuData.value.messwerte.push({
    fvc: null,
    fev1: null,
    fev1_fvc: null,
    fef25_75: null,
    mef75: null,
    mef50: null,
    mef25: null,
    pef: null,
    fet: null,
    fivc: null,
    pif: null
  })
}

const removeMesswert = (index: number) => {
  if (lufuData.value.messwerte.length > 1) {
    lufuData.value.messwerte.splice(index, 1)
  }
}

const removeSollwert = (index: number) => {
  if (lufuData.value.sollwerte.length > 1) {
    lufuData.value.sollwerte.splice(index, 1)
  }
}

const removeSollProzentWert = (index: number) => {
  if (lufuData.value.sollProzentWerte.length > 1) {
    lufuData.value.sollProzentWerte.splice(index, 1)
  }
}

const removeUgwWert = (index: number) => {
  if (lufuData.value.ugwWerte.length > 1) {
    lufuData.value.ugwWerte.splice(index, 1)
  }
}

const saveLufuData = async () => {
  // Validierung: Datum muss vorhanden sein
  if (!lufuData.value.datum) {
    alert('Bitte geben Sie ein Datum ein.')
    return
  }

  try {
    const result = await saveLufuToDatabase({
      datum: lufuData.value.datum,
      groesse: lufuData.value.groesse,
      gewicht: lufuData.value.gewicht,
      gesamtergebnis: lufuData.value.gesamtergebnis,
      messungKh: lufuData.value.messungKh,
      messwerte: lufuData.value.messwerte,
      sollwerte: lufuData.value.sollwerte,
      sollProzentWerte: lufuData.value.sollProzentWerte,
      ugwWerte: lufuData.value.ugwWerte
    })

    if (result) {
      console.log('Lufu-Daten erfolgreich gespeichert:', result)
      // Formular zurücksetzen nach erfolgreichem Speichern
      resetLufuData()
      // Erfolgsmeldung anzeigen
      alert('Lungenfunktions-Daten wurden erfolgreich gespeichert!')
    } else {
      console.error('Fehler beim Speichern der Lufu-Daten')
      if (lufuError.value) {
        alert(`Fehler beim Speichern: ${lufuError.value}`)
      } else {
        alert('Fehler beim Speichern der Daten. Bitte versuchen Sie es erneut.')
      }
    }
  } catch (error) {
    console.error('Unerwarteter Fehler:', error)
    alert('Ein unerwarteter Fehler ist aufgetreten.')
  }
}

const resetLufuData = () => {
  lufuData.value = {
    datum: new Date().toISOString().split('T')[0],
    groesse: null,
    gewicht: null,
    gesamtergebnis: null,
    messungKh: false,
    messwerte: [{
      fvc: null,
      fev1: null,
      fev1_fvc: null,
      fef25_75: null,
      mef75: null,
      mef50: null,
      mef25: null,
      pef: null,
      fet: null,
      fivc: null,
      pif: null
    }],
    sollwerte: [{
      fvc: null,
      fev1: null,
      fev1_fvc: null,
      fef25_75: null,
      mef75: null,
      mef50: null,
      mef25: null,
      pef: null,
      fet: null,
      fivc: null,
      pif: null
    }],
    sollProzentWerte: [{
      fvc: null,
      fev1: null,
      fev1_fvc: null,
      fef25_75: null,
      mef75: null,
      mef50: null,
      mef25: null,
      pef: null,
      fet: null,
      fivc: null,
      pif: null
    }],
    ugwWerte: [{
      fvc: null,
      fev1: null,
      fev1_fvc: null,
      fef25_75: null,
      mef75: null,
      mef50: null,
      mef25: null,
      pef: null,
      fet: null,
      fivc: null,
      pif: null
    }]
  }
}
</script>

<template>
  <div class="lufu-entry-view">
    <h2>Lungenfunktions-Daten eingeben</h2>

    <!-- Basisdaten Block -->
    <div class="lufu-form-section">
      <h3>Basisdaten</h3>
      <form class="lufu-base-form">
        <div class="form-group">
          <label for="datum">Datum:</label>
          <input type="date" id="datum" v-model="lufuData.datum" required />
        </div>
        <div class="form-group">
          <label for="groesse">Größe (cm):</label>
          <input type="number" id="groesse" v-model="lufuData.groesse" step="0.1" min="100" max="250" />
        </div>
        <div class="form-group">
          <label for="gewicht">Gewicht (kg):</label>
          <input type="number" id="gewicht" v-model="lufuData.gewicht" step="0.1" min="20" max="200" />
        </div>
        <div class="form-group">
          <label for="gesamtergebnis">Gesamtergebnis FEV1 Soll (%):</label>
          <input type="number" id="gesamtergebnis" v-model="lufuData.gesamtergebnis" step="0.1" min="0" max="200" />
        </div>
        <div class="form-group">
          <label for="messungKh">
            <input type="checkbox" id="messungKh" v-model="lufuData.messungKh" />
            KH-Messung
          </label>
        </div>
      </form>
    </div>

    <!-- Messwerte Block -->
    <div class="lufu-form-section">
      <div class="section-header">
        <h3>Messwerte</h3>
        <div class="button-group">
          <button type="button" @click="addMesswert" class="add-btn">+ Messwert hinzufügen</button>
        </div>
      </div>

      <div v-for="(messwert, index) in lufuData.messwerte" :key="index" class="messwert-block">
        <div class="messwert-header">
          <h4>Messung {{ index + 1 }}</h4>
          <button type="button" @click="removeMesswert(index)" class="remove-btn" v-if="lufuData.messwerte.length > 1">×</button>
        </div>

        <div class="messwert-form">
          <div class="form-row">
            <div class="form-group">
              <label>FVC [L]:</label>
              <input type="number" v-model="messwert.fvc" step="0.01" min="0" />
            </div>
            <div class="form-group">
              <label>FEV1 [L]:</label>
              <input type="number" v-model="messwert.fev1" step="0.01" min="0" />
            </div>
            <div class="form-group">
              <label>FEV1/FVC:</label>
              <input type="number" v-model="messwert.fev1_fvc" step="0.01" min="0" max="1" />
            </div>
          </div>

          <div class="form-row">
            <!-- Konditionelle Anzeige: FEF25-75% für normale Messungen -->
            <div class="form-group" v-if="!lufuData.messungKh">
              <label>FEF25-75% [L/s]:</label>
              <input type="number" v-model="messwert.fef25_75" step="0.01" min="0" />
            </div>
            <div class="form-group">
              <label>PEF [L/s]:</label>
              <input type="number" v-model="messwert.pef" step="0.01" min="0" />
            </div>
            <!-- MEF-Werte für KH-Messungen -->
            <div class="form-group" v-if="lufuData.messungKh">
              <label>MEF75 [L/s]:</label>
              <input type="number" v-model="messwert.mef75" step="0.01" min="0" />
            </div>
            <div class="form-group" v-if="lufuData.messungKh">
              <label>MEF50 [L/s]:</label>
              <input type="number" v-model="messwert.mef50" step="0.01" min="0" />
            </div>
            <div class="form-group" v-if="lufuData.messungKh">
              <label>MEF25 [L/s]:</label>
              <input type="number" v-model="messwert.mef25" step="0.01" min="0" />
            </div>
            <div class="form-group" v-if="!lufuData.messungKh">
              <label>FET [s]:</label>
              <input type="number" v-model="messwert.fet" step="0.01" min="0" />
            </div>
          </div>

          <div class="form-row" v-if="!lufuData.messungKh">
            <div class="form-group">
              <label>FIVC [L]:</label>
              <input type="number" v-model="messwert.fivc" step="0.01" min="0" />
            </div>
            <div class="form-group">
              <label>PIF [L/s]:</label>
              <input type="number" v-model="messwert.pif" step="0.01" min="0" />
            </div>
          </div>
        </div>
      </div>

      <!-- UGW-Werte Sektion -->
      <div v-if="lufuData.ugwWerte.length > 0" class="messwerte-section">
        <h4>UGW-Werte (Untere Grenzwerte)</h4>
        <div v-for="(ugwWert, index) in lufuData.ugwWerte" :key="`ugw-${index}`" class="messwert-block">
          <div class="messwert-header">
            <h5>UGW {{ index + 1 }}</h5>
            <button type="button" @click="removeUgwWert(index)" class="remove-btn" v-if="lufuData.ugwWerte.length > 1">×</button>
          </div>
          <div class="messwert-form">
            <div class="form-row">
              <div class="form-group">
                <label>FVC UGW [L]:</label>
                <input type="number" v-model="ugwWert.fvc" step="0.01" min="0" />
              </div>
              <div class="form-group">
                <label>FEV1 UGW [L]:</label>
                <input type="number" v-model="ugwWert.fev1" step="0.01" min="0" />
              </div>
              <div class="form-group">
                <label>FEV1/FVC UGW:</label>
                <input type="number" v-model="ugwWert.fev1_fvc" step="0.01" min="0" max="1" />
              </div>
            </div>
            <div class="form-row">
              <!-- Konditionelle Anzeige: FEF25-75% für normale Messungen -->
              <div class="form-group" v-if="!lufuData.messungKh">
                <label>FEF25-75% UGW [L/s]:</label>
                <input type="number" v-model="ugwWert.fef25_75" step="0.01" min="0" />
              </div>
              <div class="form-group">
                <label>PEF UGW [L/s]:</label>
                <input type="number" v-model="ugwWert.pef" step="0.01" min="0" />
              </div>
              <!-- MEF-Werte für KH-Messungen -->
              <div class="form-group" v-if="lufuData.messungKh">
                <label>MEF75 UGW [L/s]:</label>
                <input type="number" v-model="ugwWert.mef75" step="0.01" min="0" />
              </div>
              <div class="form-group" v-if="lufuData.messungKh">
                <label>MEF50 UGW [L/s]:</label>
                <input type="number" v-model="ugwWert.mef50" step="0.01" min="0" />
              </div>
              <div class="form-group" v-if="lufuData.messungKh">
                <label>MEF25 UGW [L/s]:</label>
                <input type="number" v-model="ugwWert.mef25" step="0.01" min="0" />
              </div>

              <div class="form-group" v-if="!lufuData.messungKh">
                <label>FET UGW [s]:</label>
                <input type="number" v-model="ugwWert.fet" step="0.01" min="0" />
              </div>
            </div>
            <div class="form-row" v-if="!lufuData.messungKh">
              <div class="form-group">
                <label>FIVC UGW [L]:</label>
                <input type="number" v-model="ugwWert.fivc" step="0.01" min="0" />
              </div>
              <div class="form-group">
                <label>PIF UGW [L/s]:</label>
                <input type="number" v-model="ugwWert.pif" step="0.01" min="0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Soll-Werte Sektion -->
      <div v-if="lufuData.sollwerte.length > 0 && !lufuData.messungKh" class="messwerte-section">
        <h4>Soll-Werte</h4>
        <div v-for="(sollwert, index) in lufuData.sollwerte" :key="`soll-${index}`" class="messwert-block">
          <div class="messwert-header">
            <h5>Soll-Werte {{ index + 1 }}</h5>
            <button type="button" @click="removeSollwert(index)" class="remove-btn" v-if="lufuData.sollwerte.length > 1">×</button>
          </div>
          <div class="messwert-form">
            <div class="form-row">
              <div class="form-group">
                <label>FVC Soll [L]:</label>
                <input type="number" v-model="sollwert.fvc" step="0.01" min="0" />
              </div>
              <div class="form-group">
                <label>FEV1 Soll [L]:</label>
                <input type="number" v-model="sollwert.fev1" step="0.01" min="0" />
              </div>
              <div class="form-group">
                <label>FEV1/FVC Soll:</label>
                <input type="number" v-model="sollwert.fev1_fvc" step="0.01" min="0" max="1" />
              </div>
            </div>
            <div class="form-row">
              <!-- Konditionelle Anzeige: FEF25-75% für normale Messungen -->
              <div class="form-group" v-if="!lufuData.messungKh">
                <label>FEF25-75% Soll [L/s]:</label>
                <input type="number" v-model="sollwert.fef25_75" step="0.01" min="0" />
              </div>
              <div class="form-group">
                <label>PEF Soll [L/s]:</label>
                <input type="number" v-model="sollwert.pef" step="0.01" min="0" />
              </div>
              <!-- MEF-Werte für KH-Messungen -->
              <div class="form-group" v-if="lufuData.messungKh">
                <label>MEF75 Soll [L/s]:</label>
                <input type="number" v-model="sollwert.mef75" step="0.01" min="0" />
              </div>
              <div class="form-group" v-if="lufuData.messungKh">
                <label>MEF50 Soll [L/s]:</label>
                <input type="number" v-model="sollwert.mef50" step="0.01" min="0" />
              </div>
              <div class="form-group" v-if="lufuData.messungKh">
                <label>MEF25 Soll [L/s]:</label>
                <input type="number" v-model="sollwert.mef25" step="0.01" min="0" />
              </div>
              <div class="form-group" v-if="!lufuData.messungKh">
                <label>FET Soll [s]:</label>
                <input type="number" v-model="sollwert.fet" step="0.01" min="0" />
              </div>
            </div>
            <div class="form-row" v-if="!lufuData.messungKh">
              <div class="form-group">
                <label>FIVC Soll [L]:</label>
                <input type="number" v-model="sollwert.fivc" step="0.01" min="0" />
              </div>
              <div class="form-group">
                <label>PIF Soll [L/s]:</label>
                <input type="number" v-model="sollwert.pif" step="0.01" min="0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Soll-Prozent-Werte Sektion -->
      <div v-if="lufuData.sollProzentWerte.length > 0" class="messwerte-section">
        <h4>Soll-Prozent-Werte</h4>
        <div v-for="(sollProzent, index) in lufuData.sollProzentWerte" :key="`soll-prozent-${index}`" class="messwert-block">
          <div class="messwert-header">
            <h5>%Soll {{ index + 1 }}</h5>
            <button type="button" @click="removeSollProzentWert(index)" class="remove-btn" v-if="lufuData.sollProzentWerte.length > 1">×</button>
          </div>
          <div class="messwert-form">
            <div class="form-row">
              <div class="form-group">
                <label>FVC %Soll:</label>
                <input type="number" v-model="sollProzent.fvc" step="0.1" min="0" max="200" />
              </div>
              <div class="form-group">
                <label>FEV1 %Soll:</label>
                <input type="number" v-model="sollProzent.fev1" step="0.1" min="0" max="200" />
              </div>
              <div class="form-group">
                <label>FEV1/FVC %Soll:</label>
                <input type="number" v-model="sollProzent.fev1_fvc" step="0.1" min="0" max="200" />
              </div>
            </div>
            <div class="form-row">
              <!-- Konditionelle Anzeige: FEF25-75% für normale Messungen -->
              <div class="form-group" v-if="!lufuData.messungKh">
                <label>FEF25-75% %Soll:</label>
                <input type="number" v-model="sollProzent.fef25_75" step="0.1" min="0" max="200" />
              </div>
              <div class="form-group">
                <label>PEF %Soll:</label>
                <input type="number" v-model="sollProzent.pef" step="0.1" min="0" max="200" />
              </div>
              <!-- MEF-Werte für KH-Messungen -->
              <div class="form-group" v-if="lufuData.messungKh">
                <label>MEF75 %Soll:</label>
                <input type="number" v-model="sollProzent.mef75" step="0.1" min="0" max="200" />
              </div>
              <div class="form-group" v-if="lufuData.messungKh">
                <label>MEF50 %Soll:</label>
                <input type="number" v-model="sollProzent.mef50" step="0.1" min="0" max="200" />
              </div>
              <div class="form-group" v-if="lufuData.messungKh">
                <label>MEF25 %Soll:</label>
                <input type="number" v-model="sollProzent.mef25" step="0.1" min="0" max="200" />
              </div>
              <div class="form-group" v-if="!lufuData.messungKh">
                <label>FET %Soll:</label>
                <input type="number" v-model="sollProzent.fet" step="0.1" min="0" max="200" />
              </div>
            </div>
            <div class="form-row" v-if="!lufuData.messungKh">
              <div class="form-group">
                <label>FIVC %Soll:</label>
                <input type="number" v-model="sollProzent.fivc" step="0.1" min="0" max="200" />
              </div>
              <div class="form-group">
                <label>PIF %Soll:</label>
                <input type="number" v-model="sollProzent.pif" step="0.1" min="0" max="200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button
          type="button"
          @click="saveLufuData"
          class="save-btn"
          :disabled="lufuLoading"
        >
          {{ lufuLoading ? 'Speichere...' : 'Daten speichern' }}
        </button>
        <button
          type="button"
          @click="resetLufuData"
          class="reset-btn"
          :disabled="lufuLoading"
        >
          Zurücksetzen
        </button>
      </div>

      <!-- Fehleranzeige -->
      <div v-if="lufuError" class="error-message">
        {{ lufuError }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Lufu Views Styles */
.lufu-entry-view {
  padding: 2rem;
}

.lufu-entry-view h2 {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

/* Lufu Form Styles */
.lufu-form-section {
  background-color: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px var(--shadow);
}

.lufu-form-section h3 {
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.add-btn {
  background-color: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.add-btn:hover {
  background-color: var(--accent-primary-hover);
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.messwerte-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid var(--border-color);
}

.messwerte-section h4 {
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.messwerte-section h5 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.lufu-base-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px var(--accent-primary-hover);
}

.messwert-block {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.messwert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.messwert-header h4 {
  color: var(--text-primary);
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.remove-btn {
  background-color: var(--error);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  line-height: 1;
}

.remove-btn:hover {
  background-color: #c82333;
}

.messwert-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.save-btn {
  background-color: var(--success);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 2rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.save-btn:hover {
  background-color: #218838;
}

.reset-btn {
  background-color: var(--text-secondary);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 2rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.reset-btn:hover {
  background-color: #5a6268;
}

.save-btn:disabled,
.reset-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: var(--error);
  background-color: #fee;
  border: 1px solid var(--error);
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
}

/* Mobile optimizations for Lufu forms */
@media (max-width: 768px) {
  .lufu-entry-view {
    padding: 1rem;
  }

  .lufu-form-section {
    padding: 1rem;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .lufu-base-form {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
