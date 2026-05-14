import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import Energia from '../views/Energia.vue'
import Medidor from '../views/Medidor.vue'
import Luces from '../views/Luces.vue'
import Clima from '../views/Clima.vue'
import Admin from '../views/Admin.vue'
import Reportes from '../views/Reportes.vue'
import Perfil from '../views/Perfil.vue'
import Manual from '../views/Manual.vue'

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/energia', name: 'Energia', component: Energia, meta: { requiresAuth: true } },
  { path: '/medidor', name: 'Medidor', component: Medidor, meta: { requiresAuth: true } },
  { path: '/luces', name: 'Luces', component: Luces, meta: { requiresAuth: true } },
  { path: '/clima', name: 'Clima', component: Clima, meta: { requiresAuth: true } },
  { path: '/admin', name: 'Admin', component: Admin, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/reportes', name: 'Reportes', component: Reportes, meta: { requiresAuth: true } },
  { path: '/perfil', name: 'Perfil', component: Perfil, meta: { requiresAuth: true } },
  { path: '/manual', name: 'Manual', component: Manual, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  // Si la ruta requiere auth y no hay token, ir a login
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } 
  // Si ya está logueado e intenta entrar a /login, ir a dashboard
  else if (to.path === '/login' && token) {
    next('/dashboard')
  }
  // Si no está logueado e intenta entrar a / (raíz), ir a login
  else if (to.path === '/' && !token) {
    next('/login')
  }
  // Si está logueado e intenta entrar a / (raíz), ir a dashboard
  else if (to.path === '/' && token) {
    next('/dashboard')
  }
  else {
    next()
  }
})

export default router