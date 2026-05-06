import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

function getHaConfig() {
  const token = process.env.HA_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjZjk0YzliNDQ5YWI0MDU4OTYyNjY0MzBiOGY1NTQ1ZCIsImlhdCI6MTc2MTI0ODE4NSwiZXhwIjoyMDc2NjA4MTg1fQ.td4gYVW3qHq2zvHXBRu1Kusgep36Ff1UFEHbQwFu1fE';
  const url = process.env.HA_URL || 'http://192.168.90.243:8123';
  console.log('HA Config - URL:', url, 'Token configured:', token.length > 0);
  return {
    HA_URL: url,
    HA_TOKEN: token
  };
}

let cachedData = {
  potencia: 0,
  voltage: 220,
  current: 0,
  solarPower: 0,
  batterySoc: 0,
  gridConsumption: 0,
  importado: 0,
  exportado: 0,
  solarDia: 0,
  consumoDia: 0,
  aireSalon: 0,
  aireRecepcion: 0,
  aireDiseno: 0,
  timestamp: null
};

let cachedLights = [
  { id: 'light.foco_cuarto1_luz', name: 'Foco Cuarto 1', state: 'on', entity_id: 'light.foco_cuarto1_luz' }
];

let cachedAC = [
  { id: 'salon', name: 'AA Salón', room: 'Salón', state: 'on', power: 1436, entity_id: 'switch.aire_salon' },
  { id: 'recepcion', name: 'AA Recepción', room: 'Recepción', state: 'on', power: 2179, entity_id: 'switch.aire_recepcion' },
  { id: 'diseno', name: 'AA Diseño', room: 'Diseño', state: 'on', power: 8, entity_id: 'switch.aire_diseno' }
];

async function fetchFromHomeAssistant() {
  const { HA_URL, HA_TOKEN } = getHaConfig();
  
  if (!HA_TOKEN || HA_TOKEN === 'tu-ha-token') {
    console.log('HA Token no configurado, esperando datos...');
    return cachedData;
  }
  
  try {
    console.log('Fetching from HA:', HA_URL);
    const response = await axios.get(`${HA_URL}/api/states`, {
      headers: { 'Authorization': `Bearer ${HA_TOKEN}` },
      timeout: 5000
    });
    
    const haData = {};
    const haEntities = {};
    for (const entity of response.data) {
      const entityId = entity.entity_id.toLowerCase();
      haData[entityId] = parseFloat(entity.state) || 0;
      haEntities[entityId] = entity;
    }
    
    cachedLights = [];
    const switchIds = [
      'switch.sonoff_10006944a0',
      'switch.sonoff_1000689d99',
      'switch.sonoff_1000d10979',
      'switch.sonoff_10014560db',
      'switch.luces_interruptor_1',
      'switch.luces_interruptor_2',
      'switch.luces_interruptor_3'
    ];
    const roomNames = [
      'Salón',
      'Recepción', 
      'Comedor',
      'Fotocopiado',
      'Diseño',
      'Ventas',
      'Pasillo'
    ];
    
    for (let i = 0; i < switchIds.length; i++) {
      const entityId = switchIds[i].toLowerCase();
      const entity = haEntities[entityId]
      console.log(`Light ${roomNames[i]} (${entityId}): state=${entity?.state}`)
      cachedLights.push({
        id: switchIds[i],
        name: roomNames[i],
        state: entity?.state || 'off',
        entity_id: switchIds[i]
      });
    }
    
    function getTemp(ents, switches) {
      for (const [temp, entity] of Object.entries(switches)) {
        const state = ents[entity]?.state
        console.log(`Temp check: ${entity} = ${state}`)
        if (state === 'on') return parseInt(temp)
      }
      return null
    }

    const tempSwitches = {
      salon: { 24: 'switch.temp_24_salon3', 25: 'switch.temp_25_salon3', 26: 'switch.temp_26_salon3' },
      recepcion: { 24: 'switch.temp_24_recepcion', 25: 'switch.temp_25_recepcion', 26: 'switch.temp_26_recepcion' },
      diseno: { 24: 'switch.temp24_aire2', 25: 'switch.temp25_aire2', 26: 'switch.temp26_aire2' },
      laboratorio: { 24: 'switch.temp_24_aire4', 25: 'switch.temp_25_aire4', 26: 'switch.temp_26_aire4' }
    }

    console.log('Checking temp switches for salon 26:', haEntities['switch.temp_26_salon3'])
    console.log('Checking temp switches for recepcion 26:', haEntities['switch.temp_26_recepcion'])

    cachedAC = [
      { id: 'salon', name: 'Aire Salon', room: 'Salón', state: haEntities['switch.aire3']?.state || 'off', power: haData['sensor.aasalon_w'] || 0, entity_id: 'switch.aire3', temperature: getTemp(haEntities, tempSwitches.salon) },
      { id: 'recepcion', name: 'Aire Recepcion', room: 'Recepción', state: haEntities['switch.aire1']?.state || 'off', power: haData['sensor.potencia_aarecepcion'] || 0, entity_id: 'switch.aire1', temperature: getTemp(haEntities, tempSwitches.recepcion) },
      { id: 'diseno', name: 'Aire Diseno', room: 'Diseño', state: haEntities['switch.aire2']?.state || 'off', power: haData['sensor.potencia_aadiseno'] || 0, entity_id: 'switch.aire2', temperature: getTemp(haEntities, tempSwitches.diseno) },
      { id: 'laboratorio', name: 'Aire Laboratorio', room: 'Laboratorio', state: haEntities['switch.aire4']?.state || 'off', power: haData['sensor.sonoff_10016fb57a_power'] || 0, entity_id: 'switch.aire4', temperature: getTemp(haEntities, tempSwitches.laboratorio) }
    ];
    
    const solarPV1 = haData['sensor.inverter_megarevo_pv1_power'] || 0;
    const solarPV2 = haData['sensor.inverter_megarevo_pv2_power'] || 0;
    
    cachedData = {
      potencia: haData['sensor.consumooficina'] || 0,
      solarPower: haData['sensor.gensolar'] || 0,
      pv1: solarPV1,
      pv2: solarPV2,
      batterySoc: haData['sensor.inverter_megarevo_battery'] || 0,
      gridConsumption: haData['sensor.intercambioneto'] || (haData['sensor.importado'] || 0) - (haData['sensor.exportado'] || 0),
      voltage: haData['sensor.inverter_megarevo_grid_l1_voltage'] || 220,
      current: haData['sensor.inverter_megarevo_grid_l1_current'] || 0,
      importado: haData['sensor.importado'] || 0,
      exportado: haData['sensor.exportado'] || 0,
      solarDia: haData['sensor.gensolar_energy_energy_dia'] || 0,
      consumoDia: haData['sensor.consumooficina_energy_energy_dia'] || 0,
      aireSalon: haData['sensor.aasalon_w'] || 0,
      aireRecepcion: haData['sensor.potencia_aarecepcion'] || 0,
      aireDiseno: haData['sensor.potencia_aadiseno'] || 0,
      aireLaboratorio: haData['sensor.sonoff_10016fb57a_power'] || 0,
      exportDia: haData['sensor.nodered_export_diia_2'] || haData['sensor.exportado'] || 0,
      importDia: haData['sensor.nodered_import_diia_2'] || haData['sensor.importado'] || 0,
      debugExport: haData['sensor.nodered_export_diia_2'],
      debugImport: haData['sensor.nodered_import_diia_2'],
      energiaExportada: haData['sensor.ajuste_de_energia_saliente_2'] || 0,
      energiaImportada: haData['sensor.ajuste_de_energia_entrante_2'] || 0,
      generadoMensual: haData['sensor.generado_mesual_2'] || 0,
      activaMensual: haData['sensor.activa_mesual_2'] || 0,
      consumoPagar: haData['sensor.consumo_a_pagar_2'] || 0,
      excedenteAnual: haData['sensor.excedente_anual_2'] || 0,
      timestamp: new Date().toISOString()
    };
    
    console.log('✓ HA: Solar=' + cachedData.solarPower + 'W, Consumo=' + cachedData.potencia + 'W, Bateria=' + cachedData.batterySoc + '%');
    
  } catch (error) {
    console.error('Error HA:', error.message);
  }
  
  return cachedData;
}

export function startPolling(intervalMs = 5000) {
  const { HA_URL } = getHaConfig();
  console.log('Iniciando polling HA cada ' + intervalMs + 'ms...');
  console.log('HA URL:', HA_URL);
  
  fetchFromHomeAssistant();
  
  setInterval(fetchFromHomeAssistant, intervalMs);
}

export function getEnergyData() {
  return { ...cachedData };
}

export async function refreshData() {
  return await fetchFromHomeAssistant();
}

export function getLights() {
  return { ...cachedLights };
}

export function getAirConditioners() {
  return { ...cachedAC };
}

export async function controlSwitch(entityId, action) {
  const { HA_URL, HA_TOKEN } = getHaConfig();

  console.log('ControlSwitch called:', entityId, action, 'HA_URL:', HA_URL);

  if (!HA_TOKEN || HA_TOKEN === 'tu-ha-token') {
    console.log('No HA Token configured, simulating success');
    return { success: true, message: 'Simulated (no HA token)' };
  }

  try {
    const service = action === 'off' ? 'turn_off' : 'turn_on';
    console.log('Calling HA:', `${HA_URL}/api/services/switch/${service}`);

    const response = await axios.post(`${HA_URL}/api/services/switch/${service}`, {
      entity_id: entityId
    }, {
      headers: { 'Authorization': `Bearer ${HA_TOKEN}` },
      timeout: 5000
    });

    console.log('HA Response:', response.data);
    await fetchFromHomeAssistant();
    return { success: true };
  } catch (error) {
    console.error('Error controlling switch:', error.message);
    return { success: false, error: error.message };
  }
}

export default {
  startPolling,
  getEnergyData,
  refreshData,
  getLights,
  getAirConditioners,
  controlSwitch
};