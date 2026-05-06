<template>
  <div class="admin-page">
    <h1>Administración</h1>

    <div class="admin-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
      </button>
    </div>
    
    <div v-if="activeTab === 'devices'" class="tab-content">
      <div class="section-header">
        <h2>Dispositivos</h2>
        <button class="btn-add" @click="openAddDeviceModal">+ Agregar</button>
      </div>
      
      <div class="devices-table">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Habitación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="device in devices" :key="device.id">
              <td>{{ device.name }}</td>
              <td>{{ device.type }}</td>
              <td>{{ device.room || '-' }}</td>
              <td>
                <span :class="['status-badge', device.state]">{{ device.state }}</span>
              </td>
              <td>
                <button class="btn-edit" @click="editDevice(device)">Editar</button>
                <button class="btn-delete" @click="deleteDevice(device.id)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Agregar Dispositivo -->
    <div v-if="showAddDevice" class="modal-overlay" @click.self="showAddDevice = false">
      <div class="modal-content">
        <h3>Agregar Dispositivo</h3>
        <div class="form-group">
          <label>Nombre</label>
          <input type="text" v-model="newDevice.name" placeholder="Nombre del dispositivo" class="form-input" />
        </div>
        <div class="form-group">
          <label>Tipo</label>
          <select v-model="newDevice.type" class="form-input">
            <option value="light">Luz</option>
            <option value="ac">AC/Clima</option>
            <option value="energy">Energía</option>
            <option value="outlet">Enchufe</option>
            <option value="sensor">Sensor</option>
          </select>
        </div>
        <div class="form-group">
          <label>Habitación</label>
          <input type="text" v-model="newDevice.room" placeholder="Ej: Living, Dormitorio" class="form-input" />
        </div>
        <div class="form-group">
          <label>ID Dispositivo (opcional)</label>
          <input type="text" v-model="newDevice.device_id" placeholder="ID del dispositivo en Node-RED" class="form-input" />
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showAddDevice = false">Cancelar</button>
          <button class="btn-confirm" @click="createDevice">Crear</button>
        </div>
      </div>
    </div>
    
    <div v-if="activeTab === 'meters'" class="tab-content">
      <div class="section-header">
        <h2>Medidores</h2>
        <button class="btn-add" @click="showAddMeter = true">+ Agregar</button>
      </div>
      
      <div class="meters-grid">
        <div v-for="meter in meters" :key="meter.id" class="meter-card">
          <h3>{{ meter.name }}</h3>
          <p>Tipo: {{ meter.type }}</p>
          <p>Proveedor: {{ meter.provider || '-' }}</p>
          <div class="meter-values">
            <div class="value-row">
              <span>Proveedor:</span>
              <input type="number" v-model="meter.provider_value" @change="syncMeter(meter)" />
            </div>
            <div class="value-row">
              <span>Local:</span>
              <input type="number" v-model="meter.local_value" />
            </div>
          </div>
          <p class="last-sync">Última sincronización: {{ meter.last_sync || 'Nunca' }}</p>
          <button class="btn-edit" @click="editMeter(meter)">Editar</button>
        </div>
      </div>
    </div>
    
    <div v-if="activeTab === 'users'" class="tab-content">
      <div class="section-header">
        <h2>Usuarios</h2>
        <button class="btn-add" @click="showAddUser = true">+ Agregar Usuario</button>
      </div>
      
      <div class="users-table">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.username }}</td>
              <td>{{ user.email || '-' }}</td>
              <td><span class="role-badge">{{ user.role }}</span></td>
              <td>{{ user.created_at?.split('T')[0] }}</td>
              <td>
                <button class="btn-password" @click="openPasswordModal(user)" title="Cambiar contraseña">🔑</button>
                <button class="btn-delete" @click="deleteUser(user.id)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Cambiar Contraseña -->
    <div v-if="showPasswordModal" class="modal-overlay" @click.self="showPasswordModal = false">
      <div class="modal-content">
        <h3>Cambiar Contraseña</h3>
        <p class="modal-subtitle">Usuario: <strong>{{ selectedUser?.username }}</strong></p>
        <div class="form-group">
          <label>Nueva Contraseña</label>
          <input 
            type="password" 
            v-model="newPassword" 
            placeholder="Ingrese nueva contraseña"
            class="form-input"
          />
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showPasswordModal = false">Cancelar</button>
          <button class="btn-confirm" @click="changePassword">Guardar</button>
        </div>
      </div>
    </div>
    
    <div v-if="activeTab === 'alerts'" class="tab-content">
      <div class="section-header">
        <h2>Alertas</h2>
        <button class="btn-add" @click="showAddAlert = true">+ Nueva Alerta</button>
      </div>
      
      <div class="alerts-list">
        <div 
          v-for="alert in alerts" 
          :key="alert.id"
          class="alert-item"
          :class="{ triggered: alert.triggered }"
        >
          <div class="alert-info">
            <span class="alert-type">{{ alert.type }}</span>
            <p>{{ alert.message }}</p>
            <small v-if="alert.threshold">Umbral: {{ alert.threshold }}</small>
          </div>
          <button 
            v-if="!alert.triggered"
            class="btn-ack" 
            @click="acknowledgeAlert(alert.id)"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="activeTab === 'stats'" class="tab-content">
      <h2>Estadísticas y Estado de Dispositivos</h2>
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-value">{{ stats.devices }}</div>
          <div class="stat-label">Dispositivos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.meters }}</div>
          <div class="stat-label">Medidores</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ stats.alerts }}</div>
          <div class="stat-label">Alertas Activas</div>
        </div>
      </div>
      
      <h3 class="section-title">Estado de Dispositivos</h3>
      <div class="device-status-list">
        <div 
          v-for="device in devices" 
          :key="device.id"
          class="device-status-item"
          :class="getDeviceStatusClass(device)"
        >
          <div class="device-status-icon">
            <span v-if="device.state === 'on'">🟢</span>
            <span v-else-if="device.state === 'off'">🔴</span>
            <span v-else>⚪</span>
          </div>
          <div class="device-status-info">
            <span class="device-name">{{ device.name }}</span>
            <span class="device-room">{{ device.room || 'Sin habitación' }}</span>
          </div>
          <div class="device-status-badge">
            <span class="status-label" :class="device.state">
              {{ getDeviceStatusLabel(device) }}
            </span>
            <span class="device-type">{{ getDeviceTypeLabel(device.type) }}</span>
          </div>
        </div>
        <p v-if="devices.length === 0" class="no-devices">No hay dispositivos registrados</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const tabs = [
  { id: 'devices', name: 'Dispositivos' },
  { id: 'meters', name: 'Medidores' },
  { id: 'users', name: 'Usuarios' },
  { id: 'alerts', name: 'Alertas' },
  { id: 'stats', name: 'Estadísticas' }
]

const activeTab = ref('devices')
const devices = ref([])
const meters = ref([])
const alerts = ref([])
const users = ref([])
const stats = ref({ devices: 0, meters: 0, alerts: 0 })
const showAddDevice = ref(false)
const showAddMeter = ref(false)
const showAddAlert = ref(false)
const showAddUser = ref(false)
const showPasswordModal = ref(false)
const selectedUser = ref(null)
const newPassword = ref('')
const newDevice = ref({ name: '', type: 'light', room: '', device_id: '' })

const fetchData = async () => {
  const token = localStorage.getItem('token')
  
  if (!token) {
    alert('No tienes sesión activa. Por favor, inicia sesión como admin.')
    return
  }
  
  const headers = { Authorization: `Bearer ${token}` }
  
  try {
    const [devicesRes, metersRes, alertsRes, statsRes, usersRes] = await Promise.all([
      axios.get('/api/devices'),
      axios.get('/api/admin/meters', { headers }),
      axios.get('/api/admin/alerts', { headers }),
      axios.get('/api/admin/stats', { headers }),
      axios.get('/api/admin/users', { headers })
    ])
    
    devices.value = devicesRes.data.devices || []
    meters.value = metersRes.data.meters || []
    alerts.value = alertsRes.data.alerts || []
    stats.value = statsRes.data.stats || { devices: 0, meters: 0, alerts: 0 }
    users.value = usersRes.data.users || []
    
    console.log('Users loaded:', users.value)
  } catch (error) {
    console.error('Error fetching admin data:', error)
    const errorMsg = error.response?.data?.error || error.message
    if (errorMsg.includes('Token') || errorMsg.includes('token') || errorMsg.includes('inválid')) {
      alert('Tu sesión expiró. Por favor, inicia sesión nuevamente.')
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else {
      alert('Error al cargar datos: ' + errorMsg)
    }
  }
}

const editDevice = (device) => {
  console.log('Edit device:', device)
}

const deleteDevice = async (id) => {
  if (confirm('¿Eliminar dispositivo?')) {
    await axios.delete(`/api/devices/${id}`)
    fetchData()
  }
}

const editMeter = (meter) => {
  console.log('Edit meter:', meter)
}

const syncMeter = async (meter) => {
  const token = localStorage.getItem('token')
  await axios.put(`/api/admin/meters/${meter.id}`, {
    provider_value: meter.provider_value,
    local_value: meter.local_value
  }, { headers: { Authorization: `Bearer ${token}` } })
}

const acknowledgeAlert = async (id) => {
  const token = localStorage.getItem('token')
  await axios.put(`/api/admin/alerts/${id}/acknowledge`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  })
  fetchData()
}

const deleteUser = async (id) => {
  if (confirm('¿Eliminar este usuario?')) {
    const token = localStorage.getItem('token')
    await axios.delete(`/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchData()
  }
}

const newUser = ref({ username: '', email: '', password: '' })

const createUser = async () => {
  const token = localStorage.getItem('token')
  try {
    await axios.post('/api/admin/users', newUser.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showAddUser.value = false
    newUser.value = { username: '', email: '', password: '' }
    fetchData()
  } catch (error) {
    alert(error.response?.data?.error || 'Error al crear usuario')
  }
}

const openPasswordModal = (user) => {
  selectedUser.value = user
  newPassword.value = ''
  showPasswordModal.value = true
}

const changePassword = async () => {
  if (!newPassword.value || newPassword.value.length < 4) {
    alert('La contraseña debe tener al menos 4 caracteres')
    return
  }
  const token = localStorage.getItem('token')
  try {
    await axios.put(`/api/admin/users/${selectedUser.value.id}/password`, 
      { password: newPassword.value },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    showPasswordModal.value = false
    alert('Contraseña actualizada correctamente')
  } catch (error) {
    alert('Error al cambiar contraseña')
  }
}

const openAddDeviceModal = () => {
  newDevice.value = { name: '', type: 'light', room: '', device_id: '' }
  showAddDevice.value = true
}

const createDevice = async () => {
  if (!newDevice.value.name) {
    alert('El nombre del dispositivo es requerido')
    return
  }
  try {
    await axios.post('/api/devices', newDevice.value)
    showAddDevice.value = false
    fetchData()
    alert('Dispositivo creado correctamente')
  } catch (error) {
    alert('Error al crear dispositivo')
  }
}

const getDeviceStatusClass = (device) => {
  if (device.status === 'offline') return 'offline'
  if (device.state === 'on') return 'on'
  return 'off'
}

const getDeviceStatusLabel = (device) => {
  if (device.status === 'offline') return 'Desconectado'
  if (device.state === 'on') return 'Encendido'
  return 'Apagado'
}

const getDeviceTypeLabel = (type) => {
  const types = {
    light: 'Luz',
    ac: 'AC',
    energy: 'Energía',
    outlet: 'Enchufe',
    sensor: 'Sensor'
  }
  return types[type] || type
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.admin-page h1 {
  margin-bottom: 1.5rem;
}

.admin-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px 8px 0 0;
  border: 1px solid #2d2d44;
  border-bottom: none;
  background: transparent;
  color: #8899a6;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #1a1a2e;
  color: #00d4aa;
  border-color: #00d4aa;
  border-bottom: 1px solid #1a1a2e;
}

.tab-content {
  background: #1a1a2e;
  padding: 1.5rem;
  border-radius: 0 12px 12px 12px;
  border: 1px solid #2d2d44;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.btn-add {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  background: #00d4aa;
  color: #0f1419;
  font-weight: 600;
  cursor: pointer;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #2d2d44;
}

th {
  color: #8899a6;
  font-weight: 500;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.status-badge.on {
  background: #1a3a2e;
  color: #00d4aa;
}

.status-badge.off {
  background: #2d1a1a;
  color: #ff6b6b;
}

.btn-edit, .btn-delete {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #2d2d44;
  background: transparent;
  color: #8899a6;
  cursor: pointer;
  margin-right: 0.5rem;
}

.btn-delete {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.meters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.meter-card {
  background: #0f1419;
  padding: 1rem;
  border-radius: 8px;
}

.meter-card h3 {
  color: #00d4aa;
  margin-bottom: 0.5rem;
}

.meter-values {
  margin: 1rem 0;
}

.value-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.value-row input {
  width: 100px;
  padding: 0.25rem;
  border-radius: 4px;
  border: 1px solid #2d2d44;
  background: #1a1a2e;
  color: #e7e9ea;
}

.last-sync {
  color: #8899a6;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #0f1419;
  border-radius: 8px;
  border-left: 3px solid #00d4aa;
}

.alert-item.triggered {
  opacity: 0.6;
}

.alert-type {
  color: #00d4aa;
  font-weight: 600;
}

.btn-ack {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #00d4aa;
  background: transparent;
  color: #00d4aa;
  cursor: pointer;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stats-cards .stat-card {
  background: #0f1419;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.stats-cards .stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #00d4aa;
}

.users-table table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #2d2d44;
}

.users-table th {
  color: #94a3b8;
  font-weight: 500;
}

.users-table td {
  color: #fff;
}

.role-badge {
  background: #334155;
  color: #94a3b8;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1a1a2e;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #2d2d44;
  width: 90%;
  max-width: 400px;
}

.modal-content h3 {
  color: #00d4aa;
  margin-bottom: 0.5rem;
}

.modal-subtitle {
  color: #8899a6;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  color: #94a3b8;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #2d2d44;
  background: #0f1419;
  color: #fff;
  font-size: 0.9rem;
}

.form-input:focus {
  outline: none;
  border-color: #00d4aa;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #ff6b6b;
  background: transparent;
  color: #ff6b6b;
  cursor: pointer;
}

.btn-confirm {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  background: #00d4aa;
  color: #0f1419;
  font-weight: 600;
  cursor: pointer;
}

.btn-password {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #2d2d44;
  background: transparent;
  color: #f59e0b;
  cursor: pointer;
  margin-right: 0.5rem;
  font-size: 1rem;
}

.btn-password:hover {
  background: #f59e0b;
  color: #0f1419;
}

/* Device Status in Stats */
.section-title {
  color: #94a3b8;
  margin: 2rem 0 1rem;
  font-size: 1.1rem;
  font-weight: 500;
}

.device-status-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.device-status-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #0f1419;
  border-radius: 8px;
  border-left: 3px solid;
}

.device-status-item.on {
  border-left-color: #00d4aa;
}

.device-status-item.off {
  border-left-color: #ff6b6b;
}

.device-status-item.offline {
  border-left-color: #94a3b8;
}

.device-status-icon {
  font-size: 1.5rem;
}

.device-status-info {
  flex: 1;
}

.device-name {
  display: block;
  color: #fff;
  font-weight: 500;
}

.device-room {
  display: block;
  color: #8899a6;
  font-size: 0.875rem;
}

.device-status-badge {
  text-align: right;
}

.status-label {
  display: block;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.25rem;
}

.status-label.on {
  background: #1a3a2e;
  color: #00d4aa;
}

.status-label.off {
  background: #2d1a1a;
  color: #ff6b6b;
}

.status-label.offline {
  background: #334155;
  color: #94a3b8;
}

.device-type {
  display: block;
  color: #94a3b8;
  font-size: 0.8rem;
}

.no-devices {
  color: #8899a6;
  text-align: center;
  padding: 2rem;
}
</style>