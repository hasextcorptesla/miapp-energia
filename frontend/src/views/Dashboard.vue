<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg class="w-8 h-8 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        <h1 class="text-2xl font-bold text-white">Energy Flow</h1>
      </div>
      <div class="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
        <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
        <span class="text-emerald-400 text-sm font-medium">LIVE</span>
      </div>
    </div>

    <!-- Flow Diagram -->
    <div class="glass-card p-4">
      <svg ref="svgRef" class="w-full h-auto" viewBox="0 0 800 320"></svg>
    </div>

    <!-- Balance Bars -->
    <div class="glass-card p-3">
      <h2 class="text-base font-semibold text-white mb-1">Balance Energético Hoy</h2>
      <div class="flex justify-around items-end gap-2 h-32">
        <!-- Solar -->
        <div class="flex flex-col items-center">
          <div 
            class="w-14 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg transition-all duration-500"
            :style="{ height: solarBarHeight + '%' }"
          ></div>
          <span class="text-amber-400 font-bold text-sm mt-1">{{ solarDia.toFixed(1) }} kWh</span>
          <span class="text-slate-400 text-xs">Solar</span>
        </div>
        <!-- Consumo -->
        <div class="flex flex-col items-center">
          <div 
            class="w-14 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500"
            :style="{ height: consumoBarHeight + '%' }"
          ></div>
          <span class="text-blue-400 font-bold text-sm mt-1">{{ consumoDia.toFixed(1) }} kWh</span>
          <span class="text-slate-400 text-xs">Consumo</span>
        </div>
        <!-- Export -->
        <div class="flex flex-col items-center">
          <div 
            class="w-14 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-500"
            :style="{ height: exportBarHeight + '%' }"
          ></div>
          <span class="text-emerald-400 font-bold text-sm mt-1">{{ exportDia.toFixed(1) }} kWh</span>
          <span class="text-slate-400 text-xs">Export</span>
        </div>
        <!-- Import -->
        <div class="flex flex-col items-center">
          <div 
            class="w-14 bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg transition-all duration-500"
            :style="{ height: importBarHeight + '%' }"
          ></div>
          <span class="text-red-400 font-bold text-sm mt-1">{{ importDia.toFixed(1) }} kWh</span>
          <span class="text-slate-400 text-xs">Import</span>
        </div>
      </div>
    </div>

    <!-- Line Chart - Evolución del Día -->
    <div class="glass-card p-2">
      <h2 class="text-sm font-semibold text-white">Evolución del Día</h2>
      <div class="h-40">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Solar -->
      <div class="glass-card-hover p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <svg class="w-7 h-7 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-white">{{ formatPower(solarPower) }}</div>
            <div class="text-slate-400 text-sm">Generación Solar</div>
          </div>
        </div>
      </div>

      <!-- Consumo -->
      <div class="glass-card-hover p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <svg class="w-7 h-7 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-white">{{ formatPower(consumoPower) }}</div>
            <div class="text-slate-400 text-sm">Consumo Actual</div>
          </div>
        </div>
      </div>

      <!-- Batería -->
      <div class="glass-card-hover p-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <svg class="w-7 h-7 text-purple-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"/><line x1="23" y1="13" x2="23" y2="11"/></svg>
          </div>
          <div>
            <div class="text-2xl font-bold text-white">{{ batterySoc }}%</div>
            <div class="text-slate-400 text-sm">Batería</div>
          </div>
        </div>
      </div>

      </div>

    <!-- Daily Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Generación Hoy -->
      <div class="glass-card p-4 border-l-4 border-l-amber-500">
        <div class="flex items-center gap-3">
          <svg class="w-8 h-8 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          <div>
            <div class="text-slate-400 text-sm">Generación Hoy</div>
            <div class="text-xl font-bold text-amber-400">{{ solarDia.toFixed(2) }} kWh</div>
          </div>
        </div>
      </div>

      <!-- Consumo Hoy -->
      <div class="glass-card p-4 border-l-4 border-l-blue-500">
        <div class="flex items-center gap-3">
          <svg class="w-8 h-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>
          <div>
            <div class="text-slate-400 text-sm">Consumo Hoy</div>
            <div class="text-xl font-bold text-blue-400">{{ consumoDia.toFixed(2) }} kWh</div>
          </div>
        </div>
      </div>

      <!-- Autoconsumo -->
      <div class="glass-card p-4 border-l-4" 
           :class="selfConsumption >= 50 ? 'border-l-emerald-500' : 'border-l-orange-500'">
        <div class="flex items-center gap-3">
          <svg :class="['w-8 h-8', selfConsumption >= 50 ? 'text-emerald-400' : 'text-orange-400']" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3"/><path d="M15 1v3"/><path d="M9 20v3"/><path d="M15 20v3"/><path d="M20 9h3"/><path d="M20 14h3"/><path d="M1 9h3"/><path d="M1 14h3"/></svg>
          <div>
            <div class="text-slate-400 text-sm">Autoconsumo</div>
            <div class="text-xl font-bold" :class="selfConsumption >= 50 ? 'text-emerald-400' : 'text-orange-400'">
              {{ selfConsumption }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tooltip -->
    <Teleport to="body">
      <div v-if="tooltip.show" 
           class="fixed z-50 px-3 py-2 bg-dark-900/95 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl pointer-events-none"
           :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px', transform: 'translateY(-100%)' }">
        <div class="text-xs text-slate-400">{{ tooltip.title }}</div>
        <div class="text-sm font-semibold text-white">{{ tooltip.content }}</div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'
import * as d3 from 'd3'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

// Iconos centrados en 0,0 - diseñados para llenar el círculo r=28
const iconPaths = {
  // Sol centrado - más grande
  sun: 'M0 -14v3M0 11v3M-10-9l2 2M8 7l2 2M-12 0h3M9 0h3M-8 12l-2-2M10 9l-2-2M0 -6a7 7 0 1 0 0 14 7 7 0 0 0 0-14z',
  // Zap centrado - más grande
  zap: 'M-3 -12l-10 15h7l-1.5 8 9.5-12h-7l1.5-6z',
  // Battery centrado - más grande
  battery: 'M4 -8h14v-3H4v16h14v-3H6V-5h12v-3H4zM16 -10h3v4h-3z',
  // Plug centrado - más grande
  plug: 'M0 14v-6M-6 -6v-4h12v4M8 -6v-5a4 4 0 0 0-4-4h-6a4 4 0 0 0-4 4v6z',
  // Cpu centrado - más grande
  cpu: 'M-7 -7h14v14H-7zM-10 -7h3v3h-3zM7 -7h3v3h-3zM-10 6h3v3h-3zM7 6h3v3h-3zM-7 11h3v3h-3zM4 11h3v3h-3z'
}

// Funciones para dibujar iconos centrados
function drawIconPath(g, path, color, scale = 1.5) {
  g.append('path')
    .attr('d', path)
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 1.5)
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round')
    .attr('transform', `scale(${scale}) translate(${-12/scale}, ${-12/scale})`)
}

const svgRef = ref(null)
const chartCanvas = ref(null)
const tooltip = ref({ show: false, x: 0, y: 0, title: '', content: '' })
const consumoPower = ref(0)
const solarPower = ref(0)
const batterySoc = ref(0)
const solarDia = ref(0)
const consumoDia = ref(0)
const gridPower = ref(0)
const exportDia = ref(0)
const importDia = ref(0)
const hourlyData = ref([])
let lineChart = null

let svg, animId
const width = 800
const height = 380

const nodes = {
  panels: { x: 400, y: 40, label: 'Generación Solar', icon: 'solar', active: false },
  inverter: { x: 400, y: 160, label: 'Inversor', icon: 'inverter', active: false },
  battery: { x: 80, y: 150, label: 'Batería', icon: 'battery', active: false },
  house: { x: 400, y: 260, label: 'Consumo', icon: 'house', active: false },
  grid: { x: 720, y: 150, label: 'Red Eléctrica', icon: 'grid', active: false, importing: false }
}

const flows = [
  { id: 'solarToInv', from: 'panels', to: 'inverter', color: '#f59e0b', getActive: () => solarPower.value > 50 },
  { id: 'invToBattery', from: 'inverter', to: 'battery', color: '#22c55e', getActive: () => solarPower.value > 300 && batterySoc.value < 100 },
  { id: 'invToHouse', from: 'inverter', to: 'house', color: '#3b82f6', getActive: () => consumoPower.value > 0 },
  { id: 'invToGrid', from: 'inverter', to: 'grid', color: '#10b981', getActive: () => solarPower.value > consumoPower.value + 500 },
  { id: 'gridToInv', from: 'grid', to: 'inverter', color: '#ef4444', getActive: () => solarPower.value < consumoPower.value }
]

const maxDaily = computed(() => {
  const vals = [solarDia.value, consumoDia.value, exportDia.value, importDia.value]
  return Math.max(...vals, 1)
})

const solarBarHeight = computed(() => (solarDia.value / maxDaily.value) * 100)
const consumoBarHeight = computed(() => (consumoDia.value / maxDaily.value) * 100)
const exportBarHeight = computed(() => (exportDia.value / maxDaily.value) * 100)
const importBarHeight = computed(() => (importDia.value / maxDaily.value) * 100)

const selfConsumption = computed(() => {
  if (solarDia.value === 0) return 0
  const consumed = solarDia.value - exportDia.value
  return Math.min(100, Math.max(0, (consumed / solarDia.value) * 100))
})

function formatPower(watts) {
  if (watts >= 1000) return (watts / 1000).toFixed(1) + ' kW'
  return watts.toFixed(0) + ' W'
}

const tooltipInfo = {
  solarDia: { title: 'Generación Solar Diaria', content: 'Energía solar generada hoy.' },
  consumoDia: { title: 'Consumo Diario', content: 'Energía consumida hoy.' },
  exportDia: { title: 'Exportación', content: 'Energía enviada a la red.' },
  importDia: { title: 'Importación', content: 'Energía comprada de la red.' },
  solarCard: { title: 'Potencia Solar', content: 'Generación solar actual.' },
  consumoCard: { title: 'Consumo Actual', content: 'Consumo en tiempo real.' },
  batteryCard: { title: 'Batería', content: 'Estado de carga de la batería.' },
  gridCard: { title: 'Grid', content: 'Intercambio con la red eléctrica.' },
  autoconsumo: { title: 'Autoconsumo', content: 'Porcentaje de energía solar consumida.' }
}

function showTooltip(event, key, value) {
  const info = tooltipInfo[key] || { title: key, content: value }
  tooltip.value = {
    show: true,
    x: event.pageX,
    y: event.pageY,
    title: info.title,
    content: value
  }
}

function hideTooltip() {
  tooltip.value.show = false
}

function initSvg() {
  if (!svgRef.value) return
  
  svg = d3.select(svgRef.value)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
  
  const defs = svg.append('defs')
  
  defs.append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 8)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#64748b')
  
  const glow = defs.append('filter').attr('id', 'glow')
  glow.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur')
  const feMerge = glow.append('feMerge')
  feMerge.append('feMergeNode').attr('in', 'coloredBlur')
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic')
  
  flows.forEach(flow => {
    const from = nodes[flow.from]
    const to = nodes[flow.to]
    const midX = (from.x + to.x) / 2
    const midY = (from.y + to.y) / 2
    
    let pathD
    if (from.x === to.x) {
      pathD = `M${from.x},${from.y} L${to.x},${to.y}`
    } else {
      pathD = `M${from.x},${from.y} L${midX},${from.y} L${midX},${to.y} L${to.x},${to.y}`
    }
    
    svg.append('path')
      .attr('id', `path-${flow.id}`)
      .attr('d', pathD)
      .attr('fill', 'none')
      .attr('stroke', '#334155')
      .attr('stroke-width', 4)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
  })
  
  Object.entries(nodes).forEach(([key, node]) => {
    const g = svg.append('g')
      .attr('class', `node-${key}`)
      .attr('transform', `translate(${node.x}, ${node.y})`)
      .style('cursor', 'help')
      .on('mousemove', function(event) {
        let val = ''
        if (key === 'panels') val = formatPower(solarPower.value)
        else if (key === 'inverter') val = formatPower(solarPower.value) + ' → ' + formatPower(consumoPower.value)
        else if (key === 'battery') val = batterySoc.value + '%'
        else if (key === 'house') val = formatPower(consumoPower.value)
        else if (key === 'grid') val = formatPower(Math.abs(gridPower.value)) + (gridPower.value > 0 ? ' (import)' : ' (export)')
        showTooltip(event, key, val)
      })
      .on('mouseleave', hideTooltip)
    
    const circle = g.append('circle')
      .attr('r', 24)
      .attr('fill', '#1e293b')
      .attr('stroke', '#475569')
      .attr('stroke-width', 1.5)
      .style('filter', 'url(#glow)')
    
    if (key === 'panels') {
      drawSolarPanels(g)
    } else if (key === 'inverter') {
      drawInverter(g)
    } else if (key === 'battery') {
      // Icono Battery - paths ya centrados
      g.append('path')
        .attr('d', iconPaths.battery)
        .attr('fill', 'none')
        .attr('stroke', '#a855f7')
        .attr('stroke-width', 1.5)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
      
      // Nivel de batería overlay
      const level = Math.min(100, batterySoc.value)
      g.append('rect')
        .attr('x', -5).attr('y', -6)
        .attr('width', 10).attr('height', 8 * level / 100)
        .attr('fill', level > 50 ? '#22c55e' : level > 20 ? '#f59e0b' : '#ef4444')
        .attr('rx', 1)
      
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '48px')
        .attr('fill', '#a855f7')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text('Batería')
    } else if (key === 'house') {
      // Icono Plug - paths ya centrados
      g.append('path')
        .attr('d', iconPaths.plug)
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 1.5)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
      
      g.append('text')
        .attr('text-anchor', 'start')
        .attr('x', 30)
        .attr('y', 5)
        .attr('fill', '#3b82f6')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text('Consumo')
    } else if (key === 'grid') {
      const color = gridPower.value > 0 ? '#ef4444' : '#10b981'
      // Icono Zap - paths ya centrados
      g.append('path')
        .attr('d', iconPaths.zap)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1.5)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
      
      g.append('text')
        .attr('text-anchor', 'start')
        .attr('x', 30)
        .attr('y', 5)
        .attr('fill', color)
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text('Red')
    }
    
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', node.y < 100 ? '-40px' : '40px')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text('')
  })
}

function drawSolarPanels(g) {
  const brightness = Math.min(1, solarPower.value / 3000)
  const fillColor = d3.interpolate('#78350f', '#f59e0b')(brightness)
  
  // Icono Sun - paths ya centrados
  g.append('path')
    .attr('d', iconPaths.sun)
    .attr('fill', 'none')
    .attr('stroke', '#f59e0b')
    .attr('stroke-width', 1.5)
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round')
  
  // Centro del sol
  g.append('circle')
    .attr('cx', 0).attr('cy', 0)
    .attr('r', 4)
    .attr('fill', fillColor)
  
  g.append('text')
    .attr('text-anchor', 'start')
    .attr('x', 30)
    .attr('y', 5)
    .attr('fill', '#f59e0b')
    .attr('font-size', '11px')
    .attr('font-weight', '600')
    .text('Solar')
}

function drawInverter(g) {
  // Icono Cpu - paths ya centrados
  g.append('path')
    .attr('d', iconPaths.cpu)
    .attr('fill', 'none')
    .attr('stroke', '#f59e0b')
    .attr('stroke-width', 1.5)
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round')
  
  // LED indicador
  g.append('circle')
    .attr('cx', 12).attr('cy', -10)
    .attr('r', 2)
    .attr('fill', '#22c55e')
  
  g.append('text')
    .attr('text-anchor', 'start')
    .attr('x', 30)
    .attr('y', 28)
    .attr('fill', '#f59e0b')
    .attr('font-size', '11px')
    .attr('font-weight', '600')
    .text('Inversor')
}

function updateFlows() {
  if (!svg) {
    setTimeout(updateFlows, 500)
    return
  }

  const paths = svg.selectAll('path[id^="path-"]')
  if (paths.empty()) {
    setTimeout(updateFlows, 500)
    return
  }

  svg.selectAll('.flow-particle').remove()

  flows.forEach((flow, index) => {
    const pathEl = svg.select(`#path-${flow.id}`)
    const isActive = flow.getActive()
    const pathNode = pathEl.node()
    const pathLength = pathNode ? pathNode.getTotalLength() : 0

    if (isActive) {
      pathEl
        .attr('stroke', flow.color)
        .attr('stroke-width', 4)
        .attr('stroke-opacity', 1)
        .attr('stroke-dasharray', `8,12`)
        .style('animation', `dashMove${index} 0.8s linear infinite`)

      if (!svg.select(`#dashAnim${index}`).size()) {
        const style = svg.append('style')
          .attr('id', `dashAnim${index}`)
          .text(`
            @keyframes dashMove${index} {
              0% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: -20; }
            }
          `)
      }

      for (let i = 0; i < 3; i++) {
        const particle = svg.append('circle')
          .attr('class', 'flow-particle')
          .attr('r', 5)
          .attr('fill', flow.color)
          .style('filter', 'url(#glow)')

        const animate = particle.append('animateMotion')
          .attr('dur', `${2 + i * 0.5}s`)
          .attr('repeatCount', 'indefinite')

        if (pathNode) {
          animate.attr('path', pathEl.attr('d'))
        }
      }
    } else {
      pathEl
        .attr('stroke', '#334155')
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.3)
        .attr('stroke-dasharray', null)
        .style('animation', null)
    }
  })
}

async function fetchData() {
  try {
    const res = await axios.get('/api/nodered/energy/current')
    if (res.data.success) {
      solarPower.value = res.data.solarGenerado || 0
      consumoPower.value = res.data.consumoActual || 0
      batterySoc.value = res.data.batterySoc || 0
      solarDia.value = res.data.solarDia || 0
      consumoDia.value = res.data.consumoDia || 0
      gridPower.value = res.data.gridConsumption || 0
      exportDia.value = res.data.exportDia || 0
      importDia.value = res.data.importDia || 0
      updateFlows()
    }
  } catch (err) {
    console.error('Error fetching data:', err)
  }
}

async function fetchHourlyData() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const res = await axios.get('/api/reports/hourly?date=' + today)
    if (res.data.success && res.data.data) {
      hourlyData.value = res.data.data
      updateLineChart()
    }
  } catch (err) {
    console.error('Error fetching hourly data:', err)
  }
}

function updateLineChart() {
  if (!chartCanvas.value) return
  
  const labels = []
  const solarData = []
  const consumoData = []
  const exportData = []
  const importData = []
  
  for (let i = 0; i < 24; i++) {
    labels.push(i.toString().padStart(2, '0') + ':00')
    const hourData = hourlyData.value.find(h => h.hour === i)
    solarData.push(hourData ? hourData.solar_hour : 0)
    consumoData.push(hourData ? hourData.consumo_hour : 0)
    exportData.push(hourData ? hourData.export_hour : 0)
    importData.push(hourData ? hourData.import_hour : 0)
  }
  
  if (lineChart) lineChart.destroy()
  
  lineChart = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Solar',
          data: solarData,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Consumo',
          data: consumoData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Export',
          data: exportData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Import',
          data: importData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: '#94a3b8', usePointStyle: true, padding: 20 },
          onClick: (e, legendItem, legend) => {
            const chart = legend.chart
            const clickedIndex = legendItem.datasetIndex
            
            chart.data.datasets.forEach((d, i) => {
              d.hidden = i !== clickedIndex
            })
            chart.update()
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748b' }
        },
        y: {
          grid: { color: '#334155' },
          ticks: { color: '#64748b' },
          title: { display: true, text: 'kWh', color: '#64748b' }
        }
      }
    }
  })
}

onMounted(() => {
  setTimeout(() => {
    initSvg()
    setTimeout(() => {
      fetchData()
      fetchHourlyData()
      updateFlows()
    }, 500)
  }, 100)

  animId = setInterval(() => {
    fetchData()
    fetchHourlyData()
    setTimeout(updateFlows, 300)
  }, 5000)
})

onUnmounted(() => {
  if (animId) clearInterval(animId)
})
</script>