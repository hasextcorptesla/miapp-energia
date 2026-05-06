<template>
  <div id="app" class="min-h-screen">
    <!-- Navbar -->
    <nav v-if="isAuthenticated" class="fixed top-0 left-0 right-0 z-50 glass-card border-t-0 border-x-0 rounded-none">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          <!-- Logo -->
          <div class="flex-shrink-0">
            <img src="/logo.png" alt="Logo" class="h-24 w-auto" />
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-1">
            <router-link 
              v-for="link in navLinks" 
              :key="link.to"
              :to="link.to"
              class="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300"
              :class="{ 'bg-emerald-500/20 text-emerald-400': $route.path === link.to }"
            >
              {{ link.label }}
            </router-link>
          </div>

          <!-- Right Side -->
          <div class="flex items-center space-x-3">
            <router-link 
              to="/manual"
              class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300"
              title="Manual"
            >
              📖
            </router-link>
            <router-link 
              to="/perfil"
              class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300"
              title="Perfil"
            >
              👤
            </router-link>
            <router-link 
              v-if="isAdmin"
              to="/admin"
              class="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              Admin
            </router-link>
            <button 
              @click="logout" 
              class="btn-secondary text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const isAuthenticated = ref(!!localStorage.getItem('token'))

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/energia', label: 'Energía' },
  { to: '/luces', label: 'Luces' },
  { to: '/clima', label: 'Clima' },
  { to: '/reportes', label: 'Reportes' },
]

const checkAuth = () => {
  isAuthenticated.value = !!localStorage.getItem('token')
}

onMounted(() => {
  window.addEventListener('storage', checkAuth)
  window.addEventListener('focus', checkAuth)
})

onUnmounted(() => {
  window.removeEventListener('storage', checkAuth)
  window.removeEventListener('focus', checkAuth)
})

const user = computed(() => {
  const stored = localStorage.getItem('user')
  return stored ? JSON.parse(stored) : { role: 'user' }
})

const isAdmin = computed(() => user.value?.role === 'admin')

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  isAuthenticated.value = false
  router.push('/login')
}
</script>