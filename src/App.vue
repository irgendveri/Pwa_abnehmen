<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import LoginForm from './components/LoginForm.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import DatabaseTest from './components/DatabaseTest.vue'
import { useAuth } from './composables/useAuth'
import { computed } from 'vue'

const { user, loading, signOut } = useAuth()

const isAuthenticated = computed(() => !!user.value)
</script>

<template>
  <div>
    <header class="app-header">
      <div class="header-controls">
        <ThemeToggle />
        <div class="auth-status">
          <p v-if="loading">Lade...</p>
          <div v-else-if="isAuthenticated" class="user-info">
            <p>Eingeloggt als: {{ user?.email }}</p>
            <button @click="signOut" class="logout-btn">Ausloggen</button>
          </div>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div v-if="!loading && !isAuthenticated" class="login-section">
        <LoginForm />
      </div>

      <div v-else-if="isAuthenticated" class="app-content">
        <HelloWorld msg="Willkommen in Ihrer Abnehm-App!" />
        <DatabaseTest />
      </div>
    </main>
  </div>
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

.app-header h1 {
  margin: 0;
  color: var(--text-primary);
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
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

.app-main {
  min-height: 60vh;
  padding: 0 2rem;
  background-color: var(--bg-primary);
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
