<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <!-- Fondo con gradiente sutil -->
    <div class="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800"></div>
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.1)_0%,_transparent_50%)]"></div>
    
    <!-- Card con glassmorphism -->
    <div class="relative w-full max-w-md">
      <div class="glass-card p-8 space-y-6">
        <!-- Logo -->
        <div class="text-center">
          <img src="/logo.png" alt="Logo" class="h-36 w-auto mx-auto mb-4" />
          <p class="text-slate-400 text-sm">Sistema de Gestión de Energía</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Usuario</label>
            <input 
              type="text" 
              v-model="username" 
              class="glass-input w-full"
              placeholder="Ingresa tu usuario"
              required 
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
            <div class="relative">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                class="glass-input w-full pr-12"
                placeholder="Ingresa tu contraseña"
                required 
              />
              <button 
                type="button" 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            class="btn-primary w-full"
            :disabled="loading"
          >
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>

          <p v-if="error" class="text-red-400 text-sm text-center">{{ error }}</p>
        </form>

        <!-- Register Link -->
        <p class="text-center text-slate-400 text-sm">
          ¿No tienes cuenta? 
          <router-link to="/register" class="text-emerald-400 hover:text-emerald-300 transition-colors">
            Regístrate
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await axios.post('/api/auth/login', {
      username: username.value,
      password: password.value
    })
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      window.dispatchEvent(new Event('storage'))
      router.push('/dashboard')
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>