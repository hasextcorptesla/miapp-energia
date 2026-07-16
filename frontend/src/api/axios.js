import axios from 'axios'

const isDev = import.meta.env.DEV
const apiUrl = isDev ? '' : (import.meta.env.VITE_API_URL || 'https://undoing-sprite-jeep.ngrok-free.dev')

const api = axios.create({
  baseURL: apiUrl ? `${apiUrl}/api` : '/api',
  timeout: 15000,
  headers: isDev ? {} : { 'ngrok-skip-browser-warning': 'true' }
})

export default api