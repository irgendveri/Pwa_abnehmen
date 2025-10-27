import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { useTheme } from './composables/useTheme'
import VueApexCharts from 'vue3-apexcharts'

// Initialize theme before mounting the app
useTheme()

const app = createApp(App)
app.use(VueApexCharts)
app.mount('#app')
