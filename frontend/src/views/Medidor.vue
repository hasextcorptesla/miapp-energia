<template>
  <div class="space-y-4 sm:space-y-6">
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
  <div class="flex-1 min-w-0">
    <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-white">📊 Medidor Eléctrico</h1>
  </div>
  <button @click="showConfig = true" class="btn-secondary text-sm touch-target shrink-0">
    ⚙️ Configurar
  </button>
</div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="glass-card p-4 sm:p-5 border-l-4 border-l-red-500">
        <div class="text-slate-400 text-sm mb-1">Consumo Total</div>
        <div class="text-2xl sm:text-3xl font-bold text-red-400">{{ medidor.consumo_total?.toFixed(0) || 0 }} <span class="text-lg text-slate-400">kWh</span></div>
        <button @click="openAjustar('consumo')" class="text-xs text-slate-500 mt-2 hover:text-white">✏️ Ajustar</button>
      </div>

      <div class="glass-card p-4 sm:p-5 border-l-4 border-l-emerald-500">
        <div class="text-slate-400 text-sm mb-1">Generación Total</div>
        <div class="text-2xl sm:text-3xl font-bold text-emerald-400">{{ medidor.generacion_total?.toFixed(0) || 0 }} <span class="text-lg text-slate-400">kWh</span></div>
        <button @click="openAjustar('generacion')" class="text-xs text-slate-500 mt-2 hover:text-white">✏️ Ajustar</button>
      </div>
    </div>

    <div class="glass-card p-4 sm:p-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-white">Este Mes: {{ mesNombre }} {{ anio }}</h2>
        <span class="text-slate-400 text-sm">Día cierre: {{ medidor.dia_cierre }}</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div class="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
          <div class="text-red-400 text-xs">Consumido este mes</div>
          <div class="text-xl font-bold text-red-400">{{ medidor.consumo_mes?.toFixed(1) || 0 }} kWh</div>
        </div>
        <div class="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
          <div class="text-emerald-400 text-xs">Generado este mes</div>
          <div class="text-xl font-bold text-emerald-400">{{ medidor.generacion_mes?.toFixed(1) || 0 }} kWh</div>
        </div>
      </div>

      <div class="glass-card p-3 bg-slate-800/50">
        <div class="text-slate-400 text-sm mb-2">Gráfico del Mes</div>
        <div class="h-40 flex items-end gap-1">
          <div v-for="(dia, index) in graficoData" :key="index"
               class="flex-1 flex flex-col items-center gap-1">
            <div class="w-full flex flex-col-reverse gap-0.5 h-32">
              <div class="w-full bg-emerald-500/60 rounded-t" :style="{ height: (dia.generacion / maxGrafico * 100) + '%', minHeight: dia.generacion > 0 ? '2px' : '0' }"></div>
              <div class="w-full bg-red-500/60 rounded-t" :style="{ height: (dia.consumo / maxGrafico * 100) + '%', minHeight: dia.consumo > 0 ? '2px' : '0' }"></div>
            </div>
            <span class="text-[8px] text-slate-500">{{ dia.dia }}</span>
          </div>
        </div>
        <div class="flex justify-center gap-4 mt-2 text-xs">
          <span class="text-red-400">● Consumo</span>
          <span class="text-emerald-400">● Generación</span>
        </div>
      </div>
    </div>

    <div class="glass-card p-4 sm:p-5">
      <h2 class="text-lg font-semibold text-white mb-3">Balance del Mes</h2>
      <div class="flex items-center justify-between p-3 rounded-lg"
           :class="medidor.balance_mes >= 0 ? 'bg-red-500/10 border border-red-500/30' : 'bg-emerald-500/10 border border-emerald-500/30'">
        <span class="text-slate-300">Factura a Pagar:</span>
        <span class="text-xl font-bold" :class="medidor.balance_mes >= 0 ? 'text-red-400' : 'text-emerald-400'">
          {{ medidor.balance_mes?.toFixed(1) || 0 }} kWh
          <span class="text-sm">{{ medidor.balance_mes >= 0 ? '(a pagar)' : '(crédito)' }}</span>
        </span>
      </div>
    </div>

    <div class="glass-card p-4 sm:p-5">
      <h2 class="text-lg font-semibold text-white mb-3">Excedente Anual</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/30">
          <div class="text-emerald-400 text-xs">A Favor</div>
          <div class="text-2xl font-bold text-emerald-400">{{ medidor.excedente_favor?.toFixed(0) || 0 }} kWh</div>
        </div>
        <div class="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
          <div class="text-red-400 text-xs">En Contra</div>
          <div class="text-2xl font-bold text-red-400">{{ medidor.excedente_contra?.toFixed(0) || 0 }} kWh</div>
        </div>
      </div>
    </div>

<div class="flex flex-wrap gap-2">
  <button @click="openAjustar('ambos')" class="btn-secondary text-sm touch-target">
    ✏️ Ajustar Medidor
  </button>
  <button @click="cerrarMes" class="btn-secondary text-sm touch-target">
    📅 Cerrar Mes
  </button>
  <button @click="showHistorial = true" class="btn-secondary text-sm touch-target">
    📋 Ver Historial
  </button>
</div>

    <div v-if="showAjustar" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" @click.self="showAjustar = false">
      <div class="glass-card p-6 w-full max-w-md">
        <h3 class="text-xl font-bold text-white mb-4">Ajustar Valores del Medidor</h3>
        <div class="space-y-4">
          <div>
            <label class="text-slate-400 text-sm">Consumo Total (kWh)</label>
            <input v-model.number="ajuste.consumo" type="number" class="glass-input w-full" placeholder="37380">
          </div>
          <div>
            <label class="text-slate-400 text-sm">Generación Total (kWh)</label>
            <input v-model.number="ajuste.generacion" type="number" class="glass-input w-full" placeholder="29117">
          </div>
          <div class="flex gap-2">
            <button @click="guardarAjuste" class="btn-primary flex-1">Guardar</button>
            <button @click="showAjustar = false" class="btn-secondary flex-1">Cancelar</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showConfig" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" @click.self="showConfig = false">
      <div class="glass-card p-6 w-full max-w-md">
        <h3 class="text-xl font-bold text-white mb-4">Configurar Cierre de Facturación</h3>
        <div class="space-y-4">
          <div>
            <label class="text-slate-400 text-sm">Día del mes para cierre</label>
            <input v-model.number="config.dia_cierre" type="number" min="1" max="31" class="glass-input w-full">
          </div>
          <div class="flex gap-2">
            <button @click="guardarConfig" class="btn-primary flex-1">Guardar</button>
            <button @click="showConfig = false" class="btn-secondary flex-1">Cancelar</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showHistorial" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" @click.self="showHistorial = false">
      <div class="glass-card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <h3 class="text-xl font-bold text-white mb-4">Historial Anual {{ anio }}</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-slate-400 border-b border-white/10">
                <th class="text-left py-2">Mes</th>
                <th class="text-right py-2">Consumo</th>
                <th class="text-right py-2">Generado</th>
                <th class="text-right py-2">Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in historialData" :key="m.mes" class="border-b border-white/5">
                <td class="py-2 text-slate-300">{{ m.nombre }}</td>
                <td class="text-right text-red-400">{{ m.consumo.toFixed(0) }}</td>
                <td class="text-right text-emerald-400">{{ m.generacion.toFixed(0) }}</td>
                <td class="text-right" :class="m.balance >= 0 ? 'text-red-400' : 'text-emerald-400'">{{ m.balance.toFixed(0) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button @click="showHistorial = false" class="btn-secondary w-full mt-4">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const medidor = ref({
  consumo_total: 0,
  generacion_total: 0,
  consumo_mes: 0,
  generacion_mes: 0,
  dia_cierre: 1,
  anio_actual: 2026,
  mes_actual: 5,
  excedente_favor: 0,
  excedente_contra: 0,
  balance_mes: 0
})

const mesNombre = ref('')
const anio = ref(new Date().getFullYear())
const graficoData = ref([])
const historialData = ref([])
const showAjustar = ref(false)
const showConfig = ref(false)
const showHistorial = ref(false)

const ajuste = ref({ consumo: 0, generacion: 0 })
const ajusteError = ref('')
const config = ref({ dia_cierre: 1 })

const maxGrafico = computed(() => {
  const max = Math.max(...graficoData.value.map(d => Math.max(d.consumo, d.generacion)))
  return max || 1
})

async function fetchMedidor() {
  try {
    const res = await axios.get('/api/medidor/data')
    if (res.data.success) {
      medidor.value = res.data.data
      mesNombre.value = res.data.data.mes_nombre
      anio.value = res.data.data.anio_actual
      config.value.dia_cierre = res.data.data.dia_cierre
      // Only update ajuste values if the adjustment modal is NOT open
      // to avoid overwriting user input in the form
      if (!showAjustar.value) {
        ajuste.value.consumo = res.data.data.consumo_total
        ajuste.value.generacion = res.data.data.generacion_total
      }
    }
  } catch (err) {
    console.error('Error:', err)
  }
}

async function fetchGrafico() {
  try {
    const res = await axios.get('/api/medidor/grafico')
    if (res.data.success) {
      graficoData.value = res.data.data.filter(d => d.consumo > 0 || d.generacion > 0).slice(-15)
    }
  } catch (err) {
    console.error('Error:', err)
  }
}

async function fetchHistorial() {
  try {
    const res = await axios.get('/api/medidor/historial?anio=' + anio.value)
    if (res.data.success) {
      historialData.value = res.data.data.filter(m => m.consumo > 0 || m.generacion > 0)
    }
  } catch (err) {
    console.error('Error:', err)
  }
}

async function openAjustar(tipo) {
  showAjustar.value = true
  // Ensure we have the latest data before opening the adjustment modal
  await fetchMedidor()
  if (tipo === 'consumo') {
    // Solo ajustar consumo, mantener generación actual
    ajuste.value.consumo = medidor.value.consumo_total || 0
    ajuste.value.generacion = medidor.value.generacion_total || 0
  } else if (tipo === 'generacion') {
    // Solo ajustar generación, mantener consumo actual
    ajuste.value.consumo = medidor.value.consumo_total || 0
    ajuste.value.generacion = medidor.value.generacion_total || 0
  } else {
    // Ambos (llamado desde el botón principal)
    ajuste.value.consumo = medidor.value.consumo_total || 0
    ajuste.value.generacion = medidor.value.generacion_total || 0
  }
}

async function guardarAjuste() {
  try {
    // Validate inputs
    if (ajuste.value.consumo === '' || ajuste.value.consumo === null) {
      ajusteError.value = 'Por favor ingrese un valor para el consumo'
      return
    }
    
    if (ajuste.value.generacion === '' || ajuste.value.generacion === null) {
      ajusteError.value = 'Por favor ingrese un valor para la generación'
      return
    }
    
    const consumoNum = parseFloat(ajuste.value.consumo)
    const generacionNum = parseFloat(ajuste.value.generacion)
    
    if (isNaN(consumoNum) || consumoNum < 0) {
      ajusteError.value = 'El consumo debe ser un número válido y positivo'
      return
    }
    
    if (isNaN(generacionNum) || generacionNum < 0) {
      ajusteError.value = 'La generación debe ser un número válido y positivo'
      return
    }
    
    ajusteError.value = ''
    
    console.log('Guardando ajuste:', { consumo: consumoNum, generacion: generacionNum })
    const res = await axios.post('/api/medidor/ajustar', {
      consumo: consumoNum,
      generacion: generacionNum
    })
    console.log('Respuesta:', res.data)
    if (res.data.success) {
      showAjustar.value = false
      fetchMedidor()
    } else {
      ajusteError.value = res.data.error || 'No se pudo guardar'
    }
  } catch (err) {
    console.error('Error:', err)
    ajusteError.value = 'Error al guardar: ' + err.message
  }
}

async function guardarConfig() {
  try {
    console.log('Guardando config:', { dia_cierre: config.value.dia_cierre })
    const res = await axios.post('/api/medidor/configurar', {
      dia_cierre: config.value.dia_cierre
    })
    console.log('Respuesta config:', res.data)
    if (res.data.success) {
      showConfig.value = false
      fetchMedidor()
    } else {
      alert('Error: ' + (res.data.error || 'No se pudo guardar'))
    }
  } catch (err) {
    console.error('Error:', err)
    alert('Error al guardar: ' + err.message)
  }
}

async function cerrarMes() {
  if (confirm('¿Confirmar cierre del mes? Esto actualizará los excedentes anuales.')) {
    try {
      const res = await axios.post('/api/medidor/cerrar-mes')
      alert(res.data.message)
      fetchMedidor()
    } catch (err) {
      console.error('Error:', err)
    }
  }
}

onMounted(() => {
  fetchMedidor()
  fetchGrafico()
  fetchHistorial()
  setInterval(fetchMedidor, 10000)
  setInterval(fetchGrafico, 30000)
})
</script>