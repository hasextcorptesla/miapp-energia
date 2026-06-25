import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import './style.css'

const isDev = import.meta.env.DEV
const apiUrl = isDev ? '' : 'https://peripherals-den-provided-mouse.trycloudflare.com'

if (!isDev) {
  axios.defaults.baseURL = apiUrl
  console.log('Production API URL:', apiUrl)
} else {
  console.log('Development mode - using proxy to localhost:3000')
}

console.log('Is Dev:', isDev, 'API URL:', apiUrl || 'proxy')

const app = createApp(App)
app.use(router)
app.mount('#app')