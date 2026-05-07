import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './style.css'

// Usar proxy en desarrollo, ngrok en producción
const isDev = import.meta.env.DEV
const apiUrl = import.meta.env.VITE_API_URL || 'https://undoing-sprite-jeep.ngrok-free.dev'

if (!isDev) {
  axios.defaults.baseURL = apiUrl
  axios.defaults.headers.common['ngrok-skip-browser-warning'] = '1'
}

console.log('API URL:', apiUrl)

const app = createApp(App)
app.use(router)
app.mount('#app')