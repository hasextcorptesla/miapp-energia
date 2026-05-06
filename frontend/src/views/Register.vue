<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <!-- Fondo -->
    <div class="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800"></div>
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.1)_0%,_transparent_50%)]"></div>
    
    <!-- Card -->
    <div class="relative w-full max-w-md">
      <div class="glass-card p-8 space-y-6">
        <!-- Logo -->
        <div class="text-center">
          <img src="/logo.png" alt="Logo" class="h-36 w-auto mx-auto mb-4" />
          <p class="text-slate-400 text-sm">Crear Cuenta</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleRegister" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Usuario</label>
            <input 
              type="text" 
              v-model="username" 
              class="glass-input w-full"
              placeholder="Elige un usuario"
              required 
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input 
              type="email" 
              v-model="email" 
              class="glass-input w-full"
              placeholder="Tu email"
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
                placeholder="Elige una contraseña"
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
            {{ loading ? 'Registrando...' : 'Registrarse' }}
          </button>

          <p v-if="error" class="text-red-400 text-sm text-center">{{ error }}</p>
        </form>

        <!-- Login Link -->
        <p class="text-center text-slate-400 text-sm">
          ¿Ya tienes cuenta? 
          <router-link to="/login" class="text-emerald-400 hover:text-emerald-300 transition-colors">
            Ingresa
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
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await axios.post('/api/auth/register', {
      username: username.value,
      email: email.value,
      password: password.value
    })
    
    if (response.data.success) {
      router.push('/login')
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al registrar'
  } finally {
    loading.value = false
  }
}
</script>