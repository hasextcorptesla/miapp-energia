import axios from 'axios'

const isDev = import.meta.env.DEV
const apiUrl = isDev ? '' : (import.meta.env.VITE_API_URL || 'https://undoing-sprite-jeep.ngrok-free.dev')

const api = axios.create({
  baseURL: apiUrl || '/api',
  timeout: 15000
})

export default api