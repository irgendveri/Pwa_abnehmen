import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { useTheme } from './composables/useTheme'

// Initialize theme before mounting the app
useTheme()

createApp(App).mount('#app')
