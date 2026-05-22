<template>
  <div class="perfil-page">
    <div class="header">
      <h1>👤 Mi Perfil</h1>
      <button @click="logout" class="btn-logout">Cerrar Sesión</button>
    </div>
    
    <div class="perfil-card">
      <div class="user-info">
        <div class="avatar" :style="{ backgroundImage: avatarImage }">
          <img v-if="profileImage" :src="profileImage" alt="Perfil" />
          <span v-else>{{ user?.username?.charAt(0).toUpperCase() }}</span>
        </div>
        <h2>{{ user?.username }}</h2>
        <span class="role-badge">{{ user?.role === 'admin' ? 'Administrador' : 'Usuario' }}</span>
      </div>
    </div>
    
    <div class="perfil-card">
      <h3>Apariencia</h3>
      <div class="form-group">
        <label>Tema de la aplicación</label>
        <div class="theme-selector">
          <label class="theme-option">
            <input 
              type="radio" 
              name="theme" 
              value="light" 
              :checked="currentTheme === 'light'"
              @change="setTheme('light')"
            />
            <span>Claro ☀️</span>
          </label>
          <label class="theme-option">
            <input 
              type="radio" 
              name="theme" 
              value="dark" 
              :checked="currentTheme === 'dark'"
              @change="setTheme('dark')"
            />
            <span>Oscuro 🌙</span>
          </label>
          <label class="theme-option">
            <input 
              type="radio" 
              name="theme" 
              value="silver" 
              :checked="currentTheme === 'silver'"
              @change="setTheme('silver')"
            />
            <span>Plateado ⚪</span>
          </label>
        </div>
      </div>
    </div>
    
    <div class="perfil-card">
      <h3>Foto de Perfil</h3>
      <div class="form-group">
        <label>Cambiar foto de perfil</label>
        <input 
          type="file" 
          accept="image/*" 
          @change="onProfileImageChange"
          class="file-input"
        />
        <p class="file-hint">Formatos permitidos: JPG, PNG, PNG (máx. 5MB)</p>
      </div>
    </div>
    
    <div class="perfil-card">
      <h3>Cambiar Contraseña</h3>
      
      <form @submit.prevent="changePassword">
        <div class="form-group">
          <label>Contraseña Actual</label>
          <div class="password-input">
            <input 
              :type="showCurrent ? 'text' : 'password'" 
              v-model="currentPassword" 
              placeholder="Ingresa tu contraseña actual" 
              required 
            />
            <button type="button" class="toggle-password" @click="showCurrent = !showCurrent">
              {{ showCurrent ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label>Nueva Contraseña</label>
          <div class="password-input">
            <input 
              :type="showNew ? 'text' : 'password'" 
              v-model="newPassword" 
              placeholder="Nueva contraseña (mínimo 6 caracteres)" 
              required 
            />
            <button type="button" class="toggle-password" @click="showNew = !showNew">
              {{ showNew ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label>Confirmar Nueva Contraseña</label>
          <div class="password-input">
            <input 
              :type="showConfirm ? 'text' : 'password'" 
              v-model="confirmPassword" 
              placeholder="Confirma tu nueva contraseña" 
              required 
            />
            <button type="button" class="toggle-password" @click="showConfirm = !showConfirm">
              {{ showConfirm ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>
        
        <p v-if="message" :class="['message', success ? 'success' : 'error']">{{ message }}</p>
        
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Cambiando...' : 'Cambiar Contraseña' }}
        </button>
      </form>
    </div>
    
    <div class="perfil-card">
      <h3>Información de la App</h3>
      <div class="app-info">
        <p><strong>Versión:</strong> 1.0.0</p>
        <p><strong>Usuario desde:</strong> {{ user?.created_at?.split('T')[0] }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const user = computed(() => {
  const stored = localStorage.getItem('user')
  return stored ? JSON.parse(stored) : { username: 'Usuario', role: 'user' }
})

// Theme management
const currentTheme = ref(localStorage.getItem('theme') || 'light')

// Profile image management
const profileImage = ref(null)
const avatarImage = ref('')

onMounted(() => {
  // Apply saved theme on load
  applyTheme(currentTheme.value)
  
  // Load saved profile image
  const savedImage = localStorage.getItem('profileImage')
  if (savedImage) {
    profileImage.value = savedImage
    avatarImage.value = `url('${savedImage}')`
  }
})

const applyTheme = (theme) => {
  // Remove all theme classes
  document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-silver')
  // Add the selected theme
  document.documentElement.classList.add(`theme-${theme}`)
  // Save to localStorage
  localStorage.setItem('theme', theme)
  currentTheme.value = theme
}

const setTheme = (theme) => {
  applyTheme(theme)
}

const onProfileImageChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen')
      return
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 5MB permitido')
      return
    }
    
    // Convert to base64
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64Image = event.target.result
      profileImage.value = base64Image
      avatarImage.value = `url('${base64Image}')`
      // Save to localStorage
      localStorage.setItem('profileImage', base64Image)
    }
    reader.readAsDataURL(file)
  }
}

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const message = ref('')
const success = ref(false)
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const changePassword = async () => {
  message.value = ''
  
  if (newPassword.value.length < 6) {
    message.value = 'La contraseña debe tener al menos 6 caracteres'
    success.value = false
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    message.value = 'Las contraseñas no coinciden'
    success.value = false
    return
  }
  
  loading.value = true
  
  try {
    await axios.put('/api/auth/password', {
      username: user.value.username,
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    })
    
    message.value = 'Contraseña cambiada exitosamente'
    success.value = true
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (err) {
    message.value = err.response?.data?.error || 'Error al cambiar contraseña'
    success.value = false
  } finally {
    loading.value = false
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('theme')
  localStorage.removeItem('profileImage')
  router.push('/login')
}
</script>

<style scoped>
.perfil-page {
  max-width: 500px;
  margin: 0 auto;
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header h1 {
  color: #00d4aa;
  font-size: 1.5rem;
}

.btn-logout {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.perfil-card {
  background: #1a1a2e;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  border: 1px solid #2d2d44;
}

.user-info {
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  background: #00d4aa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #0f1419;
  margin: 0 auto 1rem;
}

.user-info h2 {
  color: #fff;
  margin-bottom: 0.5rem;
}

.role-badge {
  background: #334155;
  color: #94a3b8;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.perfil-card h3 {
  color: #fff;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  color: #94a3b8;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #2d2d44;
  background: #0f1419;
  color: #fff;
  font-size: 1rem;
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input input {
  padding-right: 40px;
}

.toggle-password {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  background: #00d4aa;
  color: #0f1419;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
}

.btn-primary:disabled {
  opacity: 0.6;
}

.message {
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 1rem;
}

.message.success {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.message.error {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.app-info p {
  color: #94a3b8;
  margin: 0.5rem 0;
}

.app-info strong {
  color: #fff;
}
</style>