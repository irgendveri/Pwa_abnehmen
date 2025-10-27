<template>
  <button
    @click="toggleTheme"
    class="theme-toggle"
    :title="`Theme: ${getThemeLabel()}`"
    aria-label="Theme wechseln"
  >
    <span class="theme-icon">{{ getThemeIcon() }}</span>
    <span class="theme-label">{{ getThemeLabel() }}</span>
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

const { toggleTheme, getThemeIcon, getThemeLabel } = useTheme()
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.theme-toggle:hover {
  background-color: var(--bg-tertiary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--shadow);
}

.theme-toggle:active {
  transform: translateY(0);
}

.theme-icon {
  font-size: 1.1em;
  line-height: 1;
}

.theme-label {
  font-weight: 500;
  min-width: 3.5rem;
  text-align: left;
}

@media (max-width: 768px) {
  .theme-label {
    display: none;
  }

  .theme-toggle {
    padding: 0.5rem;
    min-width: 2.5rem;
    justify-content: center;
  }
}
</style>
