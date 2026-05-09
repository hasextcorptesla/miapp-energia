import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './style.css'

// Siempre usar proxy en desarrollo (localhost:3000)
const isDev = import.meta.env.DEV
const apiUrl = isDev ? '' : 'https://undoing-sprite-jeep.ngrok-free.dev'

if (!isDev) {
  axios.defaults.baseURL = apiUrl
  axios.defaults.headers.common['ngrok-skip-browser-warning'] = '1'
  console.log('Production API URL:', apiUrl)
} else {
  console.log('Development mode - using proxy to localhost:3000')
}

console.log('Is Dev:', isDev, 'API URL:', apiUrl || 'proxy')

const app = createApp(App)
app.use(router)
app.mount('#app')