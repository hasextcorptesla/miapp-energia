import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

const isDev = import.meta.env.DEV
console.log('Mode:', isDev ? 'development' : 'production')

const app = createApp(App)
app.use(router)
app.mount('#app')
