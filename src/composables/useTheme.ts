import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'

const THEME_STORAGE_KEY = 'pwa-abnehmen-theme'

// Reactive theme state
const currentTheme = ref<Theme>('auto')
const isDark = ref(false)

// Initialize theme from localStorage or system preference
const initializeTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
  if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
    currentTheme.value = savedTheme
  }

  updateTheme()
}

// Update the actual theme based on current setting
const updateTheme = () => {
  if (currentTheme.value === 'auto') {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  } else {
    isDark.value = currentTheme.value === 'dark'
  }

  // Apply theme to document
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', isDark.value)
}

// Watch for system theme changes when in auto mode
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
mediaQuery.addEventListener('change', () => {
  if (currentTheme.value === 'auto') {
    updateTheme()
  }
})

// Watch for theme changes and persist to localStorage
watch(currentTheme, (newTheme) => {
  localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  updateTheme()
})

export const useTheme = () => {
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
  }

  const toggleTheme = () => {
    if (currentTheme.value === 'light') {
      setTheme('dark')
    } else if (currentTheme.value === 'dark') {
      setTheme('auto')
    } else {
      setTheme('light')
    }
  }

  const getThemeIcon = () => {
    switch (currentTheme.value) {
      case 'light':
        return '☀️'
      case 'dark':
        return '🌙'
      default:
        return '🔄'
    }
  }

  const getThemeLabel = () => {
    switch (currentTheme.value) {
      case 'light':
        return 'Hell'
      case 'dark':
        return 'Dunkel'
      default:
        return 'Auto'
    }
  }

  // Initialize on first use
  if (!document.documentElement.hasAttribute('data-theme')) {
    initializeTheme()
  }

  return {
    currentTheme,
    isDark,
    setTheme,
    toggleTheme,
    getThemeIcon,
    getThemeLabel
  }
}
