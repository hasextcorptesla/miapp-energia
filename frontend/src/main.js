import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './style.css'

// Configurar baseURL para producción
const apiUrl = import.meta.env.VITE_API_URL
if (apiUrl) {
  axios.defaults.baseURL = apiUrl
}

const app = createApp(App)
app.use(router)
app.mount('#app')