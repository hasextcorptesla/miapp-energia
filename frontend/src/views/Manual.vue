<template>
  <div class="manual-page">
    <h1>📖 Manual de Usuario</h1>
    
    <div class="manual-toc">
      <h2>Contenido</h2>
      <ul>
        <li><a href="#login" @click="scrollTo('login')">1. Iniciar Sesión</a></li>
        <li><a href="#register" @click="scrollTo('register')">2. Registrarse</a></li>
        <li><a href="#dashboard" @click="scrollTo('dashboard')">3. Dashboard</a></li>
        <li><a href="#energia" @click="scrollTo('energia')">4. Energía</a></li>
        <li><a href="#luces" @click="scrollTo('luces')">5. Luces</a></li>
        <li><a href="#clima" @click="scrollTo('clima')">6. Clima</a></li>
        <li><a href="#reportes" @click="scrollTo('reportes')">7. Reportes</a></li>
        <li><a href="#perfil" @click="scrollTo('perfil')">8. Mi Perfil</a></li>
      </ul>
    </div>
    
    <div class="manual-section" id="login">
      <h2>1. Iniciar Sesión</h2>
      <p>Para acceder a la aplicación:</p>
      <ol>
        <li>Abra la app o sitio web</li>
        <li>Ingrese su usuario y contraseña</li>
        <li>Use el botón "👁️" para ver/ocultar la contraseña</li>
        <li>Presione "Ingresar"</li>
      </ol>
      <div class="tip">💡 Si olvidó su contraseña, contacte al administrador.</div>
    </div>
    
    <div class="manual-section" id="register">
      <h2>2. Registrarse</h2>
      <p>Crear una cuenta nueva:</p>
      <ol>
        <li>Vaya a "Regístrate"</li>
        <li>Ingrese un nombre de usuario</li>
        <li>Ingrese su correo electrónico</li>
        <li>Cree una contraseña (mínimo 6 caracteres)</li>
        <li>Presione "Registrarse"</li>
      </ol>
      <div class="warning">⚠️ El administrador debe aprobar nuevos usuarios.</div>
    </div>
    
    <div class="manual-section" id="dashboard">
      <h2>3. Dashboard</h2>
      <p>La pantalla principal muestra el flujo de energía en tiempo real:</p>
      
      <h3>📊 Diagrama de Flujo</h3>
      <ul>
        <li><strong>☀️ Paneles Solares</strong> - Genera energía del sol</li>
        <li><strong>Inversor</strong> - Convierte energía solar DC a AC</li>
        <li><strong>🔋 Batería</strong> - Almacena energía sobrante</li>
        <li><strong>🏠 Consumo</strong> - Energía que usa la casa</li>
        <li><strong>⚡ Red</strong> - Conexión a la red eléctrica</li>
      </ul>
      
      <h3>📈 Barras de Balance</h3>
      <ul>
        <li><strong>Solar</strong> - kWh generados hoy</li>
        <li><strong>Consumo</strong> - kWh consumidos hoy</li>
        <li><strong>Export</strong> - kWh vendidos a la red</li>
        <li><strong>Import</strong> - kWh comprados de la red</li>
      </ul>
      
      <h3>💡 Interpretar Valores</h3>
      <ul>
        <li>Si Solar > Consumo → Hay excedente (exportación)</li>
        <li>Si Consumo > Solar → Falta energía (importación)</li>
        <li>Batería 100% = Carga completa</li>
        <li>Barra verde en Solar = Autoconsumo alto</li>
      </ul>
    </div>
    
    <div class="manual-section" id="energia">
      <h2>4. Energía</h2>
      <p>Datos detallada de energía:</p>
      <ul>
        <li><strong>Generación Hoy</strong> - Total solar generado</li>
        <li><strong>Consumo Hoy</strong> - Total energy usado</li>
        <li><strong>Generación Mes</strong> - Solar del mes</li>
        <li><strong>Consumo Mes</strong> - Energía del mes</li>
        <li><strong>Exportado</strong> - Vendida a la red</li>
        <li><strong>Importado</strong> - Comprada de la red</li>
      </ul>
    </div>
    
    <div class="manual-section" id="luces">
      <h2>5. Luces</h2>
      <p>Control de iluminación:</p>
      <ol>
        <li>Seleccione la habitación</li>
        <li>Toque el interruptor para ENCENDER/APAGAR</li>
        <li>USE "Encender Todas" para varias luces</li>
        <li>USE "Apagar Todas" para apagar todo</li>
      </ol>
      <div class="tip">💡 Los cambios se reflejan en Home Assistant.</div>
    </div>
    
    <div class="manual-section" id="clima">
      <h2>6. Clima (Aire Acondicionado)</h2>
      <p>Control de aire acondicionado:</p>
      <ol>
        <li>Seleccione el AC deseada</li>
        <li>Ajuste la temperatura con +/-</li>
        <li>ENCIENDA/APAGUE el equipo</li>
        <li>Vea el consumo en tiempo real</li>
      </ol>
      <div class="warning">⚠️ El consumo shown es aproximado.</div>
    </div>
    
    <div class="manual-section" id="reportes">
      <h2>7. Reportes</h2>
      <p>Generar reportes de energía:</p>
      <ol>
        <li>Seleccione el tipo de reporte</li>
        <li>Elija el período (día/semana/mes/año)</li>
        <li>Presione "Generar Reporte"</li>
        <li>Presione "Exportar Excel" para descargar</li>
      </ol>
      <div class="tip">💡 Excel contains todos los datos en filas y columnas.</div>
    </div>
    
    <div class="manual-section" id="perfil">
      <h2>8. Mi Perfil</h2>
      <p>Cambiar su contraseña:</p>
      <ol>
        <li>Vaya a "Mi Perfil"</li>
        <li>Ingrese su contraseña actual</li>
        <li>Ingrese la nueva contraseña</li>
        <li>Confirme la nueva contraseña</li>
        <li>Presione "Cambiar Contraseña"</li>
      </ol>
    </div>
    
    <div class="manual-footer">
      <button @click="downloadPDF" class="btn-download">📥 Descargar Manual PDF</button>
      <p>Miapp Energía v1.0.0</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const downloadPDF = () => {
  alert('Funcionalidad de PDF en desarrollo. Puede tomar una captura de pantalla.')
}
</script>

<style scoped>
.manual-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.manual-page h1 {
  color: #00d4aa;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
}

.manual-toc {
  background: #1a1a2e;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.manual-toc h2 {
  color: #fff;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.manual-toc ul {
  list-style: none;
  padding: 0;
}

.manual-toc li {
  margin: 0.5rem 0;
}

.manual-toc a {
  color: #00d4aa;
  text-decoration: none;
}

.manual-toc a:hover {
  text-decoration: underline;
}

.manual-section {
  background: #1a1a2e;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid #2d2d44;
}

.manual-section h2 {
  color: #00d4aa;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #2d2d44;
}

.manual-section h3 {
  color: #fff;
  font-size: 1.1rem;
  margin: 1.5rem 0 0.5rem;
}

.manual-section p {
  color: #94a3b8;
  margin-bottom: 1rem;
}

.manual-section ol {
  padding-left: 1.5rem;
}

.manual-section li {
  color: #94a3b8;
  margin: 0.5rem 0;
}

.manual-section ul {
  padding-left: 1.5rem;
}

.manual-section ul li {
  color: #94a3b8;
  margin: 0.3rem 0;
}

.manual-section strong {
  color: #fff;
}

.tip {
  background: rgba(34, 197, 94, 0.1);
  border-left: 3px solid #22c55e;
  padding: 0.75rem;
  margin-top: 1rem;
  color: #22c55e;
}

.warning {
  background: rgba(251, 191, 36, 0.1);
  border-left: 3px solid #fbbf24;
  padding: 0.75rem;
  margin-top: 1rem;
  color: #fbbf24;
}

.manual-footer {
  text-align: center;
  padding: 2rem;
}

.btn-download {
  background: #00d4aa;
  color: #0f1419;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
}

.manual-footer p {
  color: #64748b;
  font-size: 0.8rem;
}
</style>