<template>
  <div class="space-y-4 sm:space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-white">💡 Iluminación</h1>
      <div class="flex gap-2">
        <button @click="turnAllOn" class="btn-primary text-sm touch-target">
          ◉ Todo ON
        </button>
        <button @click="turnAllOff" class="btn-secondary text-sm touch-target">
          ◌ Todo OFF
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center text-slate-400 py-8">Cargando...</div>

    <!-- Planta Alta -->
    <div class="glass-card p-4 sm:p-6">
      <h2 class="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">📍 Planta Alta</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <div v-for="light in lightsAlta" :key="light.id"
             class="glass-card-hover p-3 sm:p-4 border cursor-pointer"
             :class="light.state === 'on' ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/10'"
             @click="toggleLight(light.id, light.state)">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xl sm:text-2xl">{{ getIcon(light.name) }}</span>
            <span class="w-3 h-3 rounded-full" :class="light.state === 'on' ? 'bg-amber-400' : 'bg-slate-600'"></span>
          </div>
          <div class="font-medium text-sm sm:text-base" :class="light.state === 'on' ? 'text-white' : 'text-slate-400'">{{ light.name }}</div>
          <div class="text-xs" :class="light.state === 'on' ? 'text-amber-400' : 'text-slate-500'">
            {{ light.state === 'on' ? 'Encendido' : 'Apagado' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Planta Baja -->
    <div class="glass-card p-4 sm:p-6">
      <h2 class="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">📍 Planta Baja</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <div v-for="light in lightsBaja" :key="light.id"
             class="glass-card-hover p-4 border cursor-pointer"
             :class="light.state === 'on' ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/10'"
             @click="toggleLight(light.id, light.state)">
          <div class="flex items-center justify-between mb-2">
            <span class="text-2xl">{{ getIcon(light.name) }}</span>
            <span class="w-3 h-3 rounded-full" :class="light.state === 'on' ? 'bg-amber-400' : 'bg-slate-600'"></span>
          </div>
          <div class="font-medium" :class="light.state === 'on' ? 'text-white' : 'text-slate-400'">{{ light.name }}</div>
          <div class="text-xs" :class="light.state === 'on' ? 'text-amber-400' : 'text-slate-500'">
            {{ light.state === 'on' ? 'Encendido' : 'Apagado' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const lights = ref([])
const loading = ref(true)

const plantaAltaNames = ['Recepción', 'Salón', 'Diseño', 'Ventas', 'Pasillo']
const plantaBajaNames = ['Comedor', 'Fotocopiado']

const lightsAlta = computed(() => lights.value.filter(l => plantaAltaNames.some(n => l.name && l.name.includes(n))))
const lightsBaja = computed(() => lights.value.filter(l => plantaBajaNames.some(n => l.name && l.name.includes(n))))

function getIcon(name) {
  const icons = { 'Salón': '🛋️', 'Recepción': '🏪', 'Comedor': '🍽️', 'Fotocopiado': '📋', 'Diseño': '🎨', 'Ventas': '💼', 'Pasillo': '🚪' }
  return icons[name] || '💡'
}

async function fetchLights() {
  try {
    const res = await axios.get('/api/nodered/lights')
    if (res.data.success && res.data.lights) {
      lights.value = Object.values(res.data.lights)
    } else {
      lights.value = []
    }
  } catch (err) {
    console.error('Error:', err)
  } finally {
    loading.value = false
  }
}

async function toggleLight(id, state) {
  // Actualizar UI inmediatamente (sin esperar servidor)
  const originalState = state
  const lightIndex = lights.value.findIndex(l => l.id === id)
  if (lightIndex !== -1) {
    lights.value[lightIndex].state = state === 'on' ? 'off' : 'on'
  }
  
  try {
    const action = state === 'on' ? 'off' : 'on'
    console.log('Toggle light:', id, action)
    const res = await axios.post('/api/nodered/light/control', { entity_id: id, action })
    console.log('Response:', res.data)
    if (!res.data.success) {
      // Revertir si hay error
      if (lightIndex !== -1) {
        lights.value[lightIndex].state = originalState
      }
      alert('Error: ' + (res.data.error || 'No se pudo controlar la luz'))
    }
  } catch (err) {
    console.error('Error toggle light:', err)
    // Revertir si hay error
    if (lightIndex !== -1) {
      lights.value[lightIndex].state = originalState
    }
    alert('Error al controlar la luz: ' + err.message)
  }
}

async function turnAllOn() {
  try {
    for (const light of lights.value) {
      if (light.state !== 'on') {
        await axios.post('/api/nodered/light/control', { entity_id: light.id, action: 'on' })
      }
    }
    await fetchLights()
  } catch (err) {
    console.error('Error:', err)
    alert('Error al encender luces')
  }
}

async function turnAllOff() {
  try {
    for (const light of lights.value) {
      if (light.state === 'on') {
        await axios.post('/api/nodered/light/control', { entity_id: light.id, action: 'off' })
      }
    }
    await fetchLights()
  } catch (err) {
    console.error('Error:', err)
    alert('Error al apagar luces')
  }
}

onMounted(fetchLights)
</script>