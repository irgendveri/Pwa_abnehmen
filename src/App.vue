<script setup lang="ts">
import LoginForm from './components/LoginForm.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import ChartsView from './components/ChartsView.vue'
import WerteForm from './components/WerteForm.vue'
import WochenplanForm from './components/WochenplanForm.vue'
import ZieleForm from './components/ZieleForm.vue'
import { useAuthStore } from './stores/auth'
import { computed, ref } from 'vue'

const { user, loading, signOut } = useAuthStore()

const isAuthenticated = computed(() => !!user.value)
const refreshKey = ref(0)
const showZieleForm = ref(false)

const handleWerteAdded = () => {
  refreshKey.value++
}

const openZieleForm = () => {
  showZieleForm.value = true
}

const closeZieleForm = () => {
  showZieleForm.value = false
}
</script>

<template>
  <div>
    <header class="app-header">
      <div class="app-title">
        <h2>Hallo {{ user?.email }}</h2>
      </div>
      <div class="header-controls">
        <ThemeToggle />
      </div>
    </header>

    <main class="app-main">
      <div v-if="!loading && !isAuthenticated" class="login-section">
        <LoginForm />
      </div>

      <div v-else-if="isAuthenticated" class="app-content">
        <!-- Formular zum Hinzufügen neuer Messwerte -->
        <WerteForm @werte-added="handleWerteAdded" />

        <!-- Wochenplan für die Mahlzeitenplanung -->
        <WochenplanForm />

        <!-- Diagramme für die Messwerte -->
        <ChartsView :key="refreshKey" />
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

.app-title h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

/* Desktop-optimized title */
@media (min-width: 768px) {
  .app-title h1 {
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
