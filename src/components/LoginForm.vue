<template>
  <div class="login-form">
    <h2>{{ isLogin ? 'Anmelden' : 'Registrieren' }}</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="email">E-Mail:</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          placeholder="ihre.email@beispiel.de"
        />
      </div>

      <div class="form-group">
        <label for="password">Passwort:</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          placeholder="Mindestens 6 Zeichen"
        />
      </div>

      <button type="submit" :disabled="loading" class="submit-btn">
        {{ loading ? 'Lädt...' : (isLogin ? 'Anmelden' : 'Registrieren') }}
      </button>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="success" class="success-message">
        {{ success }}
      </div>
    </form>

    <p class="toggle-mode">
      {{ isLogin ? 'Noch kein Konto?' : 'Bereits ein Konto?' }}
      <button @click="toggleMode" class="toggle-btn">
        {{ isLogin ? 'Registrieren' : 'Anmelden' }}
      </button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const { signIn, signUp, loading } = useAuthStore()

const email = ref('')
const password = ref('')
const isLogin = ref(true)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = null
  success.value = null
}

const handleSubmit = async () => {
  error.value = null
  success.value = null

  try {
    if (isLogin.value) {
      await signIn(email.value, password.value)
      success.value = 'Erfolgreich angemeldet!'
    } else {
      await signUp(email.value, password.value)
      success.value = 'Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mails.'
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten'
  }
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-secondary);
  box-shadow: 0 4px 6px var(--shadow);
}

.login-form h2 {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: var(--text-primary);
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}

input::placeholder {
  color: var(--text-muted);
}

input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(77, 171, 247, 0.25);
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: background-color 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--accent-primary-hover);
}

.submit-btn:disabled {
  background-color: var(--accent-secondary);
  cursor: not-allowed;
}

.error-message {
  color: var(--error);
  padding: 0.5rem;
  background-color: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: 4px;
  margin-bottom: 1rem;
}

.success-message {
  color: var(--success);
  padding: 0.5rem;
  background-color: var(--success-bg);
  border: 1px solid var(--success-border);
  border-radius: 4px;
  margin-bottom: 1rem;
}

.toggle-mode {
  text-align: center;
  margin-top: 1rem;
  color: var(--text-secondary);
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--link-color);
  text-decoration: underline;
  cursor: pointer;
  font-size: inherit;
  transition: color 0.2s ease;
}

.toggle-btn:hover {
  color: var(--link-hover);
}

@media (max-width: 480px) {
  .login-form {
    margin: 0 1rem;
    padding: 1.5rem;
  }
}
</style>
