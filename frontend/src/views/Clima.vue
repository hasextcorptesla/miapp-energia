<template>
  <div class="space-y-4 sm:space-y-6">
    <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-white">❄️ Control de Aires</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      <div v-for="ac in airConditioners" :key="ac.id"
           class="glass-card p-3 sm:p-4 lg:p-5 border transition-all duration-300"
           :class="ac.power > 50 ? 'border-emerald-500/50' : 'border-red-500/50'">

        <!-- Header -->
        <div class="flex items-center justify-between mb-2 sm:mb-3">
          <div class="flex items-center gap-2 sm:gap-3">
            <span class="text-2xl sm:text-3xl" :class="ac.power > 50 ? 'animate-pulse' : 'opacity-40'">❄️</span>
            <div>
              <div class="font-semibold text-white text-sm sm:text-base">{{ ac.name }}</div>
              <div class="text-xs sm:text-sm font-bold" :class="ac.power > 50 ? 'text-emerald-400' : 'text-red-400'">
                {{ ac.power > 50 ? 'ENCENDIDO' : 'APAGADO' }}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-lg sm:text-2xl font-bold" :class="ac.power > 50 ? 'text-emerald-400' : 'text-red-400'">
              {{ ac.power.toFixed(0) }} W
            </div>
            <div class="text-xs text-slate-500">{{ ac.room }}</div>
          </div>
        </div>

        <!-- Estado visual -->
        <div class="flex items-center justify-center py-1.5 sm:py-2 mb-2 sm:mb-3 rounded-lg"
             :class="ac.power > 50 ? 'bg-emerald-500/10' : 'bg-red-500/10'">
          <span class="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full mr-1.5 sm:mr-2"
                :class="ac.power > 50 ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'"></span>
          <span class="text-xs sm:text-sm" :class="ac.power > 50 ? 'text-emerald-400' : 'text-red-400'">
            {{ ac.power > 50 ? 'Funcionando' : 'Detenido' }}
          </span>
        </div>

        <!-- Temperatura - solo si estaendido -->
        <div v-if="ac.power > 50" class="mb-3 sm:mb-4">
          <div class="text-xs text-slate-400 mb-1.5 sm:mb-2">Temperatura: {{ getDisplayTemp(ac) ? getDisplayTemp(ac) + '°C' : '--' }}</div>
          <div class="flex gap-1.5 sm:gap-2">
            <button @click="setTemp(ac, 24)"
                    class="flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all border min-h-[40px]"
                    :class="getDisplayTemp(ac) === 24
                      ? 'bg-blue-500/50 text-blue-300 border-blue-400 shadow-lg shadow-blue-500/20'
                      : 'bg-slate-700/30 text-slate-400 border-slate-600/30 hover:bg-slate-600/50'">
              24°C
            </button>
            <button @click="setTemp(ac, 25)"
                    class="flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all border min-h-[40px]"
                    :class="getDisplayTemp(ac) === 25
                      ? 'bg-blue-500/50 text-blue-300 border-blue-400 shadow-lg shadow-blue-500/20'
                      : 'bg-slate-700/30 text-slate-400 border-slate-600/30 hover:bg-slate-600/50'">
              25°C
            </button>
            <button @click="setTemp(ac, 26)"
                    class="flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all border min-h-[40px]"
                    :class="getDisplayTemp(ac) === 26
                      ? 'bg-blue-500/50 text-blue-300 border-blue-400 shadow-lg shadow-blue-500/20'
                      : 'bg-slate-700/30 text-slate-400 border-slate-600/30 hover:bg-slate-600/50'">
              26°C
            </button>
          </div>
        </div>

        <!-- Botón Encender/Apagar -->
        <button @click="(e) => handleToggle(e, ac)" class="w-full py-3 sm:py-3.5 rounded-lg font-medium transition-all duration-300 relative z-10 text-sm sm:text-base min-h-[48px]"
                :class="ac.power > 50
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'">
          {{ ac.power > 50 ? '⏹️ Apagar' : '▶️ Encender' }}
        </button>
      </div>
    </div>

    <!-- Info -->
    <div class="glass-card p-3 sm:p-4">
      <div class="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-400">
        <span>💡 <span class="text-emerald-400">Verde</span> = Encendido (>50W)</span>
        <span>💡 <span class="text-red-400">Rojo</span> = Apagado (≤50W)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const airConditioners = ref([])
const selectedTemps = ref({})

function getDisplayTemp(ac) {
  if (ac.temperature) return ac.temperature
  return selectedTemps.value[ac.id] || null
}

async function fetchACs() {
  try {
    const res = await axios.get('/api/nodered/air-conditioners')
    console.log('AC Response:', res.data)
    if (res.data.success && res.data.airConditioners) {
      const acData = res.data.airConditioners
      if (Array.isArray(acData)) {
        acData.forEach(ac => {
          if (ac.temperature) selectedTemps.value[ac.id] = ac.temperature
        })
        airConditioners.value = acData
        acData.forEach(ac => console.log(`AC ${ac.id}: temp=${ac.temperature}, power=${ac.power}`))
      } else if (typeof acData === 'object') {
        airConditioners.value = Object.values(acData)
      }
    } else {
      airConditioners.value = []
    }
  } catch (err) {
    console.error('Error:', err)
  }
}

async function handleToggle(e, ac) {
  console.log('=== TOGGLE CLICKED ===', ac.id, 'power:', ac.power)
  await toggleAC(ac)
}

async function toggleAC(ac) {
  console.log('=== TOGGLE AC CALLED ===', ac.id)
  const action = ac.power > 50 ? 'off' : 'on'
  ac.tempAction = action
  try {
    console.log('Toggle AC:', ac.id, action)
    const res = await axios.post('/api/nodered/ac/control', { id: ac.id, action })
    console.log('Toggle result:', res.data)
    if (res.data.success) {
      ac.power = action === 'on' ? 100 : 0
      setTimeout(() => fetchACs(), 200)
    } else {
      alert('Error: ' + (res.data.error || 'No se pudo controlar el aire'))
    }
  } catch (err) {
    console.error('Error toggle:', err)
    alert('Error al controlar el aire: ' + err.message)
  }
}

async function setTemp(ac, temp) {
  try {
    console.log('Set temp:', ac.id, temp)
    const res = await axios.post('/api/nodered/ac/temperature', { id: ac.id, temperature: temp })
    console.log('Set temp result:', res.data)
    selectedTemps.value[ac.id] = temp
    ac.temperature = temp
    if (res.data.success) {
      setTimeout(() => fetchACs(), 200)
    } else {
      alert('Error: ' + (res.data.error || 'No se pudo establecer temperatura'))
    }
  } catch (err) {
    console.error('Error set temp:', err)
    alert('Error al establecer temperatura: ' + err.message)
  }
}

onMounted(() => {
  fetchACs()
  setInterval(fetchACs, 3000)
})
</script>