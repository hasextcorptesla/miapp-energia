import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './style.css'

// Usar proxy en desarrollo, VITE_API_URL en producción
const apiUrl = import.meta.env.VITE_API_URL
if (apiUrl) {
  axios.defaults.baseURL = apiUrl
}

console.log('API URL:', apiUrl)

const app = createApp(App)
app.use(router)
app.mount('#app')