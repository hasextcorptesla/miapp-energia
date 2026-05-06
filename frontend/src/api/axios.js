import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: apiUrl || '/api',
  timeout: 10000
})

export default api