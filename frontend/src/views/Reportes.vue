<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-white">Reportes</h1>

    <!-- Filtros -->
    <div class="glass-card p-4 space-y-4">
      <div class="flex flex-wrap gap-4 items-center">
        <select v-model="reportType" class="glass-input">
          <option value="consumption">Consumo de Energía</option>
          <option value="generated">Total Generado</option>
          <option value="totalConsumo">Total Consumo</option>
          <option value="costConsumo">Costo Consumo</option>
          <option value="costGenerado">Costo Generado</option>
          <option value="alerts">Alertas</option>
        </select>

        <select v-model="dateRange" class="glass-input">
          <option value="day">Hoy</option>
          <option value="yesterday">Ayer</option>
          <option value="week">Esta Semana</option>
          <option value="month">Este Mes</option>
          <option value="year">Este Año</option>
          <option value="custom">Personalizado</option>
        </select>

        <button @click="generateReport" class="btn-primary">
          Generar Reporte
        </button>
        
        <button @click="exportExcel" class="btn-secondary">
          Exportar Excel
        </button>
      </div>

      <!-- Rango Personalizado -->
      <div v-if="dateRange === 'custom'" class="flex flex-wrap gap-4 items-end p-3 bg-slate-800/30 rounded-lg">
        <div>
          <label class="text-slate-400 text-xs block mb-1">Fecha Desde</label>
          <input v-model="customStartDate" type="date" class="glass-input text-sm">
        </div>
        <div>
          <label class="text-slate-400 text-xs block mb-1">Hora Desde</label>
          <input v-model="customStartTime" type="time" class="glass-input text-sm">
        </div>
        <div>
          <label class="text-slate-400 text-xs block mb-1">Fecha Hasta</label>
          <input v-model="customEndDate" type="date" class="glass-input text-sm">
        </div>
        <div>
          <label class="text-slate-400 text-xs block mb-1">Hora Hasta</label>
          <input v-model="customEndTime" type="time" class="glass-input text-sm">
        </div>
        <button @click="generateReport" class="btn-primary text-sm py-2">
          Generar
        </button>
      </div>
    </div>

    <!-- Contenido -->
    <div class="glass-card p-6 space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div class="glass-card p-4 text-center border-l-4 border-l-amber-500">
          <h3 class="text-slate-400 text-sm mb-1">Total Generado</h3>
          <div class="text-2xl font-bold text-amber-400">{{ totalGenerated }} kWh</div>
        </div>
        <div class="glass-card p-4 text-center border-l-4 border-l-blue-500">
          <h3 class="text-slate-400 text-sm mb-1">Total Consumo</h3>
          <div class="text-2xl font-bold text-blue-400">{{ totalConsumption }} kWh</div>
        </div>
        <div class="glass-card p-4 text-center border-l-4 border-l-blue-500">
          <h3 class="text-slate-400 text-sm mb-1">Costo Consumo</h3>
          <div class="text-2xl font-bold text-blue-400">${{ costoConsumo }}</div>
        </div>
        <div class="glass-card p-4 text-center border-l-4 border-l-amber-500">
          <h3 class="text-slate-400 text-sm mb-1">Costo Generado</h3>
          <div class="text-2xl font-bold text-amber-400">${{ costoGenerado }}</div>
        </div>
        <div class="glass-card p-4 text-center border-l-4"
             :class="costoFinal >= 0 ? 'border-l-red-500' : 'border-l-emerald-500'">
          <h3 class="text-slate-400 text-sm mb-1">Costo Final</h3>
          <div class="text-2xl font-bold" :class="costoFinal >= 0 ? 'text-red-400' : 'text-emerald-400'">
            {{ costoFinal >= 0 ? '+' : '' }}${{ costoFinal }}
          </div>
        </div>
        <div class="glass-card p-4 text-center border-l-4 border-l-purple-500">
          <h3 class="text-slate-400 text-sm mb-1">Promedio Diario</h3>
          <div class="text-2xl font-bold text-purple-400">{{ avgDaily }} kWh</div>
        </div>
        <div class="glass-card p-4 text-center border-l-4 border-l-red-500">
          <h3 class="text-slate-400 text-sm mb-1">Máximo</h3>
          <div class="text-2xl font-bold text-red-400">{{ peak }} W</div>
        </div>
      </div>

      <!-- Chart -->
      <div>
        <h2 class="text-lg font-semibold text-white mb-4">{{ chartTitle }}</h2>
        <div class="h-80">
          <canvas ref="reportChart"></canvas>
        </div>
      </div>

      <!-- Alertas -->
      <div v-if="alerts.length" class="glass-card p-4">
        <h2 class="text-lg font-semibold text-white mb-4">Alertas del Período</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-white/10">
                <th class="text-left py-3 px-4 text-slate-400 font-medium">Fecha</th>
                <th class="text-left py-3 px-4 text-slate-400 font-medium">Tipo</th>
                <th class="text-left py-3 px-4 text-slate-400 font-medium">Mensaje</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="alert in alerts" :key="alert.id" class="border-b border-white/5 hover:bg-white/5">
                <td class="py-3 px-4 text-slate-300">{{ formatDate(alert.created_at) }}</td>
                <td class="py-3 px-4 text-slate-300">{{ alert.type }}</td>
                <td class="py-3 px-4 text-slate-300">{{ alert.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const reportType = ref('consumption')
const dateRange = ref('month')
const totalGenerated = ref(0)
const totalConsumption = ref(0)
const totalCost = ref(0)
const costoConsumo = ref(0)
const costoGenerado = ref(0)
const costoFinal = ref(0)
const avgDaily = ref(0)
const peak = ref(0)
const alerts = ref([])
const reportData = ref([])
const reportChart = ref(null)
let chart = null

// Custom date range variables
const customStartDate = ref('')
const customStartTime = ref('00:00')
const customEndDate = ref('')
const customEndTime = ref('23:59')

const reportTypeLabels = {
  consumption: 'Consumo de Energía',
  generated: 'Total Generado',
  totalConsumo: 'Total Consumo',
  costConsumo: 'Costo Consumo',
  costGenerado: 'Costo Generado',
  alerts: 'Alertas'
}

const dateRangeLabels = {
  day: 'Hoy',
  yesterday: 'Ayer',
  week: 'Esta Semana',
  month: 'Este Mes',
  year: 'Este Año',
  custom: 'Personalizado'
}

const chartTitle = computed(() => {
  const typeLabel = reportTypeLabels[reportType.value] || 'Historial'
  const rangeLabel = dateRangeLabels[dateRange.value] || ''
  
  if (reportType.value === 'alerts') {
    return `Alertas del Período: ${rangeLabel}`
  }
  
  return `${typeLabel} - ${rangeLabel}`
})

const generateReport = async () => {
  const today = new Date()
  let startDate, endDate

  if (dateRange.value === 'day') {
    startDate = endDate = today.toISOString().split('T')[0]
  } else if (dateRange.value === 'yesterday') {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    startDate = endDate = yesterday.toISOString().split('T')[0]
  } else if (dateRange.value === 'week') {
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    startDate = weekAgo.toISOString().split('T')[0]
    endDate = today.toISOString().split('T')[0]
  } else if (dateRange.value === 'month') {
    startDate = today.toISOString().slice(0, 8) + '01'
    endDate = today.toISOString().split('T')[0]
  } else if (dateRange.value === 'custom') {
    startDate = customStartDate.value || today.toISOString().split('T')[0]
    endDate = customEndDate.value || today.toISOString().split('T')[0]
  } else {
    startDate = today.getFullYear() + '-01-01'
    endDate = today.toISOString().split('T')[0]
  }

  try {
    const response = await axios.get('/api/reports/daily?start=' + startDate + '&end=' + endDate)
    const data = response.data.data || []

    let totalGen = 0
    let totalCons = 0

    data.forEach(d => {
      totalGen += parseFloat(d.solar_dia || 0)
      totalCons += parseFloat(d.consumo_dia || 0)
    })

    totalGenerated.value = totalGen.toFixed(1)
    totalConsumption.value = totalCons.toFixed(1)
    
    const cc = totalCons * 0.15
    const cg = totalGen * 0.06
    const cf = cc - cg
    
    costoConsumo.value = cc.toFixed(2)
    costoGenerado.value = cg.toFixed(2)
    costoFinal.value = cf.toFixed(2)
    totalCost.value = cf.toFixed(2)
    
    avgDaily.value = data.length > 0 ? (totalCons / data.length).toFixed(1) : 0

    const peakItem = data.reduce((max, d) => (d.consumo_peak > (max?.consumo_peak || 0) ? d : max), data[0])
    peak.value = peakItem ? parseFloat(peakItem.consumo_peak || 0).toFixed(0) : 0

    reportData.value = data
    updateChart(data, reportType.value)
  } catch (error) {
    console.error('Error:', error)
  }
}

const updateChart = (data, type = 'consumption') => {
  if (chart) chart.destroy()
  if (!reportChart.value) return

  const labels = data.map(d => {
    const date = new Date(d.date)
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
  })

  const datasets = []

  if (type === 'generated') {
    datasets.push({
      label: 'Generado (kWh)',
      data: data.map(d => d.solar_dia || 0),
      backgroundColor: '#f59e0b',
      borderRadius: 4
    })
  } else if (type === 'totalConsumo') {
    datasets.push({
      label: 'Consumo (kWh)',
      data: data.map(d => d.consumo_dia || 0),
      backgroundColor: '#3b82f6',
      borderRadius: 4
    })
  } else if (type === 'costConsumo') {
    datasets.push({
      label: 'Costo Consumo ($)',
      data: data.map(d => (parseFloat(d.consumo_dia || 0) * 0.15).toFixed(2)),
      backgroundColor: '#3b82f6',
      borderRadius: 4
    })
  } else if (type === 'costGenerado') {
    datasets.push({
      label: 'Costo Generado ($)',
      data: data.map(d => (parseFloat(d.solar_dia || 0) * 0.06).toFixed(2)),
      backgroundColor: '#f59e0b',
      borderRadius: 4
    })
  } else {
    // consumption, alerts - mostrar ambos
    datasets.push({
      label: 'Consumo (kWh)',
      data: data.map(d => d.consumo_dia || 0),
      backgroundColor: '#3b82f6',
      borderRadius: 4
    })
    datasets.push({
      label: 'Generado (kWh)',
      data: data.map(d => d.solar_dia || 0),
      backgroundColor: '#f59e0b',
      borderRadius: 4
    })
  }

  chart = new Chart(reportChart.value, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: true, labels: { color: '#94a3b8' } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#64748b' } },
        y: { grid: { color: '#334155' }, ticks: { color: '#64748b' } }
      }
    }
  })
}

const exportExcel = async () => {
  try {
    const today = new Date()
    let startDate, endDate
    
    if (dateRange.value === 'day') {
      startDate = endDate = today.toISOString().split('T')[0]
    } else if (dateRange.value === 'yesterday') {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      startDate = endDate = yesterday.toISOString().split('T')[0]
    } else if (dateRange.value === 'week') {
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      startDate = weekAgo.toISOString().split('T')[0]
      endDate = today.toISOString().split('T')[0]
    } else if (dateRange.value === 'month') {
      startDate = today.toISOString().slice(0, 8) + '01'
      endDate = today.toISOString().split('T')[0]
    } else if (dateRange.value === 'custom') {
      startDate = customStartDate.value || today.toISOString().split('T')[0]
      endDate = customEndDate.value || today.toISOString().split('T')[0]
    } else {
      startDate = today.getFullYear() + '-01-01'
      endDate = today.toISOString().split('T')[0]
    }
    
    const response = await axios.get('/api/reports/report', {
      params: { start: startDate, end: endDate, format: 'xlsx' },
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `reporte_energia_${startDate}_${endDate}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error('Error exporting:', error)
    alert('Error al exportar. Intente de nuevo.')
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('es-ES')
}

watch([reportType, dateRange], () => {
  if (dateRange.value !== 'custom') {
    generateReport()
  }
})

onMounted(() => {
  generateReport()
})
</script>