<template>
  <div class="space-y-4 sm:space-y-6">
    <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Energía en Tiempo Real</h1>

    <!-- Status Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between glass-card p-3 sm:p-4 gap-2">
      <span class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full" :class="mqttConnected ? 'bg-emerald-400' : 'bg-red-400'"></span>
        <span :class="mqttConnected ? 'text-emerald-400' : 'text-red-400'">
          {{ mqttConnected ? '● Conectado' : '○ Desconectado' }}
        </span>
      </span>
      <span class="text-slate-400 text-xs sm:text-sm">Última actualización: {{ lastUpdate }}</span>
    </div>

    <!-- Energy Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <!-- Solar -->
      <div class="glass-card-hover p-4 sm:p-5 border-l-4 border-l-amber-500">
        <div class="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <span class="text-2xl sm:text-3xl">☀️</span>
          <span class="text-slate-400 text-sm sm:text-base">Generación Solar</span>
        </div>
        <div class="text-2xl sm:text-3xl font-bold text-amber-400">{{ solarPower.toFixed(0) }} <span class="text-base sm:text-lg text-slate-400">W</span></div>
        <div class="text-xs sm:text-sm text-slate-500 mt-1">Potencia Instantánea</div>
      </div>

      <!-- Solar Día -->
      <div class="glass-card-hover p-4 sm:p-5 border-l-4 border-l-yellow-500">
        <div class="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <span class="text-2xl sm:text-3xl">🌞</span>
          <span class="text-slate-400 text-sm sm:text-base">Solar Día</span>
        </div>
        <div class="text-2xl sm:text-3xl font-bold text-yellow-400">{{ solarDia.toFixed(2) }} <span class="text-base sm:text-lg text-slate-400">kWh</span></div>
        <div class="text-xs sm:text-sm text-slate-500 mt-1">Generado Hoy</div>
      </div>

      <!-- Consumo -->
      <div class="glass-card-hover p-4 sm:p-5 border-l-4 border-l-blue-500">
        <div class="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <span class="text-2xl sm:text-3xl">🔌</span>
          <span class="text-slate-400 text-sm sm:text-base">Consumo Oficina</span>
        </div>
        <div class="text-2xl sm:text-3xl font-bold text-blue-400">{{ potencia.toFixed(0) }} <span class="text-base sm:text-lg text-slate-400">W</span></div>
        <div class="text-xs sm:text-sm text-slate-500 mt-1">Potencia Total</div>
      </div>

      <!-- Consumo Día -->
      <div class="glass-card-hover p-4 sm:p-5 border-l-4 border-l-cyan-500">
        <div class="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <span class="text-2xl sm:text-3xl">📊</span>
          <span class="text-slate-400 text-sm sm:text-base">Consumo Día</span>
        </div>
        <div class="text-2xl sm:text-3xl font-bold text-cyan-400">{{ consumoDia.toFixed(2) }} <span class="text-base sm:text-lg text-slate-400">kWh</span></div>
        <div class="text-xs sm:text-sm text-slate-500 mt-1">Consumido Hoy</div>
      </div>

      <!-- Importado -->
      <div class="glass-card-hover p-4 sm:p-5 border-l-4 border-l-red-500">
        <div class="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <span class="text-2xl sm:text-3xl">⬇️</span>
          <span class="text-slate-400 text-sm sm:text-base">Importado</span>
        </div>
        <div class="text-2xl sm:text-3xl font-bold text-red-400">{{ importado.toFixed(0) }} <span class="text-base sm:text-lg text-slate-400">W</span></div>
        <div class="text-xs sm:text-sm text-slate-500 mt-1">De Red</div>
      </div>

      <!-- Exportado -->
      <div class="glass-card-hover p-4 sm:p-5 border-l-4 border-l-emerald-500">
        <div class="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <span class="text-2xl sm:text-3xl">⬆️</span>
          <span class="text-slate-400 text-sm sm:text-base">Exportado</span>
        </div>
        <div class="text-2xl sm:text-3xl font-bold text-emerald-400">{{ exportado.toFixed(0) }} <span class="text-base sm:text-lg text-slate-400">W</span></div>
        <div class="text-xs sm:text-sm text-slate-500 mt-1">A Red</div>
      </div>
    </div>

    <!-- Aires -->
    <div class="glass-card p-4 sm:p-6">
      <h2 class="text-xl font-semibold text-white mb-4">Aires Acondicionados</h2>

      <!-- Total Aires -->
      <div class="glass-card p-4 mb-4 border-l-4 border-l-cyan-500">
        <div class="flex items-center justify-between">
          <span class="text-slate-400">Total Aires</span>
          <span class="text-2xl font-bold text-cyan-400">{{ totalAires.toFixed(0) }} W</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="ac in aires" :key="ac.id" 
             class="glass-card p-4 border"
             :class="ac.state === 'on' ? 'border-emerald-500/50' : 'border-white/10'">
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-white">{{ ac.name }}</span>
            <span class="text-sm" :class="ac.state === 'on' ? 'text-emerald-400' : 'text-slate-500'">
              {{ ac.state === 'on' ? 'ON' : 'OFF' }}
            </span>
          </div>
          <div class="text-2xl font-bold" :class="ac.state === 'on' ? 'text-white' : 'text-slate-500'">
            {{ ac.power.toFixed(0) }} <span class="text-sm">W</span>
          </div>
          <div class="text-xs text-slate-500 mt-1">{{ ac.room }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const mqttConnected = ref(true)
const lastUpdate = ref('')
const solarPower = ref(0)
const solarDia = ref(0)
const potencia = ref(0)
const consumoDia = ref(0)
const importado = ref(0)
const exportado = ref(0)
const aires = ref([])

let intervalId

const totalAires = computed(() => {
  return aires.value.reduce((sum, ac) => sum + ac.power, 0)
})

const fetchData = async () => {
  try {
    const res = await axios.get('/api/nodered/energy/current')
    if (res.data.success) {
      solarPower.value = res.data.solarGenerado || 0
      potencia.value = res.data.consumoActual || 0
      solarDia.value = res.data.solarDia || 0
      consumoDia.value = res.data.consumoDia || 0
      importado.value = res.data.importado || res.data.importDia || 0
      exportado.value = res.data.exportado || res.data.exportDia || 0
      lastUpdate.value = new Date().toLocaleTimeString()

      if (res.data.totalAires && res.data.totalAires > 0) {
        aires.value = [
          { id: 'salon', name: 'Aire Salon', room: 'Salón', state: res.data.aireSalon > 0 ? 'on' : 'off', power: res.data.aireSalon || 0 },
          { id: 'recepcion', name: 'Aire Recepcion', room: 'Recepción', state: res.data.aireRecepcion > 0 ? 'on' : 'off', power: res.data.aireRecepcion || 0 },
          { id: 'diseno', name: 'Aire Diseño', room: 'Diseño', state: res.data.aireDiseno > 0 ? 'on' : 'off', power: res.data.aireDiseno || 0 },
          { id: 'laboratorio', name: 'Aire Laboratorio', room: 'Laboratorio', state: res.data.aireLaboratorio > 0 ? 'on' : 'off', power: res.data.aireLaboratorio || 0 }
        ]
      } else {
        const acRes = await axios.get('/api/nodered/air-conditioners')
        if (acRes.data.success && acRes.data.airConditioners) {
          const acData = acRes.data.airConditioners
          if (Array.isArray(acData)) {
            aires.value = acData
          } else if (typeof acData === 'object') {
            aires.value = Object.values(acData)
          }
        }
      }
    }
  } catch (err) {
    console.error('Error:', err)
  }
}

onMounted(() => {
  fetchData()
  intervalId = setInterval(fetchData, 3000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>