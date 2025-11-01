<script setup lang="ts">
import LoginForm from './components/LoginForm.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import ChartsView from './components/ChartsView.vue'
import WerteForm from './components/WerteForm.vue'
import WochenplanForm from './components/WochenplanForm.vue'
import ZieleForm from './components/ZieleForm.vue'
import MotivationBlock from './components/MotivationBlock.vue'
import { useAuthStore } from './stores/auth'
import { computed, ref } from 'vue'
import { useLufu } from './composables/useLufu'

const { user, loading, signOut } = useAuthStore()
const { saveLufuData: saveLufuToDatabase, loading: lufuLoading, error: lufuError } = useLufu()

const isAuthenticated = computed(() => !!user.value)
const refreshKey = ref(0)
const showZieleForm = ref(false)
const currentView = ref('abnehmen')

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

const handleWerteAdded = () => {
  refreshKey.value++
}

const openZieleForm = () => {
  showZieleForm.value = true
}

const closeZieleForm = () => {
  showZieleForm.value = false
}

const setView = (view: string) => {
  currentView.value = view
}

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
  <div>
    <header class="app-header">
      <div class="app-title">
        <img src="/logo.svg" alt="Abnehm-Tracker Logo" class="app-logo" />
        <h2>Hallo {{ user?.email }}</h2>
      </div>
      <!-- Navigation für verschiedene App-Bereiche -->
      <nav class="app-navigation" v-if="isAuthenticated">
        <button
          @click="setView('abnehmen')"
          :class="['nav-btn', { active: currentView === 'abnehmen' }]"
          title="Abnehmen"
        >
          <span class="nav-icon">📊</span>
          <span class="nav-text">Abnehmen</span>
        </button>
        <button
          @click="setView('lufu-eintrag')"
          :class="['nav-btn', { active: currentView === 'lufu-eintrag' }]"
          title="Lufu-Eintrag"
        >
          <span class="nav-icon">🫁</span>
          <span class="nav-text">Lufu-Eintrag</span>
        </button>
        <button
          @click="setView('lufu-auswertung')"
          :class="['nav-btn', { active: currentView === 'lufu-auswertung' }]"
          title="Lufu-Auswertung"
        >
          <span class="nav-icon">📈</span>
          <span class="nav-text">Lufu-Auswertung</span>
        </button>
      </nav>
      <div class="header-controls">
        <ThemeToggle />
      </div>
    </header>

    <main class="app-main">
      <div v-if="!loading && !isAuthenticated" class="login-section">
        <LoginForm />
      </div>

      <div v-else-if="isAuthenticated" class="app-content">
        <!-- Abnehmen Ansicht (Standard) -->
        <div v-if="currentView === 'abnehmen'">
          <!-- Motivationsblock für täglich wechselnde Motivation -->
          <MotivationBlock />

          <!-- Formular zum Hinzufügen neuer Messwerte -->
          <WerteForm @werte-added="handleWerteAdded" />

          <!-- Wochenplan für die Mahlzeitenplanung -->
          <WochenplanForm />

          <!-- Diagramme für die Messwerte -->
          <ChartsView :key="refreshKey" />
        </div>

        <!-- Lufu-Eintrag Ansicht -->
        <div v-else-if="currentView === 'lufu-eintrag'" class="lufu-entry-view">
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

        <!-- Lufu-Auswertung Ansicht -->
        <div v-else-if="currentView === 'lufu-auswertung'" class="lufu-analysis-view">
          <h2>Lungenfunktions-Auswertung</h2>
          <div class="lufu-placeholder">
            <p>Hier werden die Lungenfunktionsdaten ausgewertet und visualisiert.</p>
            <p><em>Diese Funktionalität wird bald implementiert.</em></p>
            <!-- Platzhalter für zukünftige Lufu-Auswertungs-Komponente -->
          </div>
        </div>
      </div>
    </main>
  </div>
  <div class="auth-status">
    <p v-if="loading">Lade...</p>
    <div v-else-if="isAuthenticated" class="user-info">
      <p>Eingeloggt als: {{ user?.email }}</p>
      <button @click="openZieleForm" class="goals-btn">Ziele definieren</button>

      <button @click="signOut" class="logout-btn">Ausloggen</button>
    </div>
  </div>

  <!-- Ziele Form Modal -->
  <ZieleForm v-if="showZieleForm" @close="closeZieleForm" />
</template>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px var(--shadow);
}

/* Desktop-optimized header */
@media (min-width: 768px) {
  .app-header {
    padding: 0.75rem 1.5rem;
    margin-bottom: 1.5rem;
    position: sticky;
    top: 0;
    z-index: 100;
  }
}

.app-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-logo {
  height: 40px;
  width: 40px;
}

.app-title h1,
.app-title h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

/* Desktop-optimized title */
@media (min-width: 768px) {
  .app-logo {
    height: 32px;
    width: 32px;
  }

  .app-title h1,
  .app-title h2 {
    font-size: 1.25rem;
  }
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Desktop-optimized header controls */
@media (min-width: 768px) {
  .header-controls {
    gap: 0.75rem;
  }

  .user-info {
    gap: 0.75rem;
  }

  .user-info p {
    font-size: 0.9rem;
  }

  .logout-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
}

/* Navigation Styles */
.app-navigation {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  background-color: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 2rem;
  box-shadow: 0 2px 4px var(--shadow);
}

.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  background-color: transparent;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-secondary);
  min-width: 80px;
}

.nav-btn:hover {
  background-color: var(--bg-primary);
  border-color: var(--accent-primary);
  color: var(--text-primary);
}

.nav-btn.active {
  background-color: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
}

.nav-icon {
  font-size: 1.5rem;
}

.nav-text {
  font-size: 0.85rem;
  font-weight: 500;
}

/* Desktop-optimized navigation */
@media (min-width: 768px) {
  .app-navigation {
    margin: 0.75rem 1.5rem;
    padding: 0.75rem;
  }

  .nav-btn {
    flex-direction: row;
    gap: 0.5rem;
    min-width: 120px;
    padding: 0.5rem 1rem;
  }

  .nav-icon {
    font-size: 1.25rem;
  }

  .nav-text {
    font-size: 0.9rem;
  }
}

/* Mobile-optimized navigation */
@media (max-width: 767px) {
  .app-navigation {
    margin: 1rem;
    gap: 0.25rem;
  }

  .nav-btn {
    padding: 0.5rem 0.25rem;
    min-width: 60px;
  }

  .nav-text {
    font-size: 0.75rem;
  }
}

.auth-status {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.user-info p {
  margin: 0;
  font-weight: 500;
  color: var(--text-secondary);
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: var(--error);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.logout-btn:hover {
  background-color: #c82333;
}

.goals-btn {
  padding: 0.5rem 1rem;
  background-color: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.goals-btn:hover {
  background-color: var(--accent-primary-hover);
}

.app-main {
  min-height: 60vh;
  padding: 0 2rem;
  background-color: var(--bg-primary);
}

/* Desktop-optimized main content */
@media (min-width: 768px) {
  .app-main {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .app-main {
    padding: 0 1rem;
  }
}

/* Lufu Views Styles */
.lufu-entry-view,
.lufu-analysis-view {
  padding: 2rem;
}

.lufu-entry-view h2,
.lufu-analysis-view h2 {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.lufu-placeholder {
  background-color: var(--bg-secondary);
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  border: 2px dashed var(--border-color);
}

.lufu-placeholder p {
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.lufu-placeholder em {
  color: var(--accent-primary);
  font-style: italic;
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

.soll-btn {
  background-color: #17a2b8;
}

.soll-btn:hover {
  background-color: #138496;
}

.prozent-btn {
  background-color: #6f42c1;
}

.prozent-btn:hover {
  background-color: #5a32a3;
}

.ugw-btn {
  background-color: #fd7e14;
}

.ugw-btn:hover {
  background-color: #e8650e;
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
  .lufu-entry-view,
  .lufu-analysis-view {
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

.login-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.app-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* Desktop-optimized content layout */
@media (min-width: 1200px) {
  .app-content {
    max-width: 1400px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

.app-footer {
  margin-top: 4rem;
  padding: 2rem;
  text-align: center;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.logos {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.logo {
  height: 4em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em var(--accent-primary));
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .header-controls {
    width: 100%;
    justify-content: space-between;
  }

  .app-main {
    padding: 0 1rem;
  }
}
</style>
