<script setup lang="ts">
import LoginForm from './components/LoginForm.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import ChartsView from './components/ChartsView.vue'
import WerteForm from './components/WerteForm.vue'
import WochenplanForm from './components/WochenplanForm.vue'
import ZieleForm from './components/ZieleForm.vue'
import MotivationBlock from './components/MotivationBlock.vue'
import LufuEntryForm from './components/LufuEntryForm.vue'
import LufuAnalysisView from './components/LufuAnalysisView.vue'
import { useAuthStore } from './stores/auth'
import { computed, ref } from 'vue'

const { user, loading, signOut } = useAuthStore()

const isAuthenticated = computed(() => !!user.value)
const refreshKey = ref(0)
const showZieleForm = ref(false)
const currentView = ref('abnehmen')



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
        <div v-else-if="currentView === 'lufu-eintrag'">
          <LufuEntryForm />
        </div>

        <!-- Lufu-Auswertung Ansicht -->
        <div v-else-if="currentView === 'lufu-auswertung'">
          <LufuAnalysisView />
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
