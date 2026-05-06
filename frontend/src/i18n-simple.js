const translations = {
  es: {
    app: { title: "Miapp", subtitle: "Sistema de Gestión de Energía" },
    nav: { dashboard: "Dashboard", energia: "Energía", luces: "Luces", clima: "Clima", reportes: "Reportes", manual: "Manual", perfil: "Perfil", admin: "Admin", logout: "Salir" },
    dashboard: { title: "Energy Flow", live: "LIVE", balance: "Balance Energético Hoy", solar: "Solar", consumo: "Consumo", export: "Export", import: "Import", generacionSolar: "Generación Solar", consumoActual: "Consumo Actual", bateria: "Batería", importando: "Importando", exportando: "Exportando", generacionHoy: "Generación Hoy", consumoHoy: "Consumo Hoy", autoconsumo: "Autoconsumo" },
    reportes: { title: "Reportes", tipo: { consumption: "Consumo de Energía", generated: "Total Generado", cost: "Costos", alerts: "Alertas" }, rango: { day: "Hoy", week: "Esta Semana", month: "Este Mes", year: "Este Año" }, generar: "Generar Reporte", exportar: "Exportar PDF", totalGenerado: "Total Generado", totalConsumo: "Total Consumo", costoTotal: "Costo Total", promedioDiario: "Promedio Diario", maximo: "Máximo", historialConsumo: "Historial: Consumo vs Generación", historialGeneracion: "Historial de Generación Solar", historialCostos: "Historial de Costos", alertas: "Alertas del Período", fecha: "Fecha", tipo: "Tipo", mensaje: "Mensaje" },
    admin: { title: "Administración", usuarios: "Usuarios", devices: "Dispositivos", meters: "Medidores", alerts: "Alertas", stats: "Estadísticas" },
    perfil: { title: "Perfil de Usuario", cambiarPassword: "Cambiar Contraseña", passwordActual: "Contraseña Actual", nuevaPassword: "Nueva Contraseña", confirmarPassword: "Confirmar Contraseña", guardar: "Guardar", actualizado: "¡Contraseña actualizada!", error: "Error al actualizar" },
    login: { title: "Ingresar", usuario: "Usuario", password: "Contraseña", ingresar: "Ingresar", error: "Error al iniciar sesión", noCuenta: "¿No tienes cuenta?", registrate: "Regístrate" },
    register: { title: "Crear Cuenta", usuario: "Usuario", password: "Contraseña", registrar: "Registrarse" }
  },
  en: {
    app: { title: "Miapp", subtitle: "Energy Management System" },
    nav: { dashboard: "Dashboard", energia: "Energy", luces: "Lights", clima: "Climate", reportes: "Reports", manual: "Manual", perfil: "Profile", admin: "Admin", logout: "Logout" },
    dashboard: { title: "Energy Flow", live: "LIVE", balance: "Today's Energy Balance", solar: "Solar", consumo: "Consumption", export: "Export", import: "Import", generacionSolar: "Solar Generation", consumoActual: "Current Consumption", bateria: "Battery", importando: "Importing", exportando: "Exporting", generacionHoy: "Today's Generation", consumoHoy: "Today's Consumption", autoconsumo: "Self-consumption" },
    reportes: { title: "Reports", tipo: { consumption: "Energy Consumption", generated: "Total Generated", cost: "Costs", alerts: "Alerts" }, rango: { day: "Today", week: "This Week", month: "This Month", year: "This Year" }, generar: "Generate Report", exportar: "Export PDF", totalGenerado: "Total Generated", totalConsumo: "Total Consumption", costoTotal: "Total Cost", promedioDiario: "Daily Average", maximo: "Maximum", historialConsumo: "History: Consumption vs Generation", historialGeneracion: "Solar Generation History", historialCostos: "Cost History", alertas: "Period Alerts", fecha: "Date", tipo: "Type", mensaje: "Message" },
    admin: { title: "Administration", usuarios: "Users", devices: "Devices", meters: "Meters", alerts: "Alerts", stats: "Statistics" },
    perfil: { title: "User Profile", cambiarPassword: "Change Password", passwordActual: "Current Password", nuevaPassword: "New Password", confirmarPassword: "Confirm Password", guardar: "Save", actualizado: "Password updated!", error: "Error updating" },
    login: { title: "Login", usuario: "User", password: "Password", ingresar: "Login", error: "Error logging in", noCuenta: "Don't have an account?", registrate: "Register" },
    register: { title: "Create Account", usuario: "User", password: "Password", registrar: "Register" }
  }
}

const lang = (typeof navigator !== 'undefined' ? navigator.language?.split('-')[0] : null) || 'es'
const currentTranslations = translations[lang] || translations.es

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj)
}

export function t(key) {
  return getNestedValue(currentTranslations, key) || key
}

export function useI18n() {
  return { t }
}

export function getLocale() {
  return lang
}