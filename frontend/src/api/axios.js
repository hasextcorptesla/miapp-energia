import axios from 'axios'

const isDev = import.meta.env.DEV

const api = axios.create({
  baseURL: isDev ? '/api' : '/api/proxy',
  timeout: 15000
})

export default api