import { createRouter, createWebHashHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import Energia from '../views/Energia.vue'
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
  next()
})

export default router