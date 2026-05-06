import mqtt from 'mqtt';
import { io } from '../index.js';

const MQTT_BROKER = process.env.MQTT_BROKER || '192.168.90.126';
const MQTT_PORT = process.env.MQTT_PORT || 1883;
const MQTT_BROKER_LOCAL = process.env.MQTT_BROKER_LOCAL || 'localhost';
const MQTT_USER = process.env.MQTT_USER || '';
const MQTT_PASS = process.env.MQTT_PASS || '';

let client = null;
let connected = false;

const energyData = {
  potencia: 0,
  voltage: 220,
  current: 0,
  
  solarPower: 0,
  batterySoc: 0,
  gridConsumption: 0,
  
  importado: 0,
  exportado: 0,
  
  aireSalon: 0,
  aireRecepcion: 0,
  aireDiseno: 0,
  
  timestamp: null
};

const offsets = {
  importado: 28689,
  exportado: 22305,
  mensualActiva: 29125,
  mensualGenerada: 22526
};

const topics = {
  'GenSolar': { key: 'solarPower', transform: v => v },
  'IntercambioNeto': { key: 'gridConsumption', transform: v => v },
  'consumoOficina': { key: 'potencia', transform: v => v },
  'Potencia_Total': { key: 'potencia', transform: v => v },
  
  'VoltajeA': { key: 'voltage', transform: v => v },
  'CorrienteA': { key: 'current', transform: v => v },
  
  'AASalonW': { key: 'aireSalon', transform: v => v },
  'AARecepcionW': { key: 'aireRecepcion', transform: v => v },
  'AADisenoW': { key: 'aireDiseno', transform: v => v },
  
  'Excedente': { key: 'exportado', transform: v => v },
  'Impotar': { key: 'importado', transform: v => v },
  
  'ME_Intercambio_Neto': { key: 'gridConsumption', transform: v => v }
};

export function initMQTT() {
  const url = `${MQTT_BROKER}:${MQTT_PORT}`;
  console.log(`Conectando a MQTT: ${url}`);
  
  const options = {
    clientId: `miapp_${Math.random().toString(16).slice(2, 10)}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 5000
  };
  
  if (MQTT_USER && MQTT_PASS) {
    options.username = MQTT_USER;
    options.password = MQTT_PASS;
  }
  
  client = mqtt.connect(url, options);
  
  client.on('connect', () => {
    console.log('✓ Conectado a MQTT broker');
    connected = true;
    
    const subscribeTopics = Object.keys(topics);
    subscribeTopics.forEach(topic => {
      client.subscribe(topic, { qos: 1 }, (err) => {
        if (err) console.log(`Error suscribiendo a ${topic}:`, err.message);
      });
    });
    
    console.log(`Suscrito a ${subscribeTopics.length} topics`);
  });
  
  client.on('message', (topic, message) => {
    try {
      const value = parseFloat(message.toString());
      if (isNaN(value)) return;
      
      const config = topics[topic];
      if (!config) return;
      
      let finalValue = config.transform(value);
      
      if (topic === 'Impotar') {
        finalValue = value + offsets.importado;
      } else if (topic === 'Excedente') {
        finalValue = value + offsets.exportado;
      }
      
      energyData[config.key] = finalValue;
      energyData.timestamp = new Date().toISOString();
      
      io.emit('energy:update', {
        topic,
        value: finalValue,
        data: { ...energyData }
      });
      
    } catch (e) {
      // ignore parse errors
    }
  });
  
  client.on('error', (err) => {
    console.error('Error MQTT:', err.message);
    connected = false;
  });
  
  client.on('close', () => {
    connected = false;
    console.log('Desconectado del broker MQTT');
  });
  
  client.on('reconnect', () => {
    console.log('Reconectando a MQTT...');
  });
}

export function getEnergyData() {
  return { ...energyData };
}

export function getOffsets() {
  return { ...offsets };
}

export function setOffset(key, value) {
  if (offsets.hasOwnProperty(key)) {
    offsets[key] = value;
    console.log(`Offset actualizado: ${key} = ${value}`);
    return true;
  }
  return false;
}

export function isConnected() {
  return connected;
}

export function publish(topic, value) {
  if (client && connected) {
    client.publish(topic, String(value), { qos: 1 });
  }
}

export default {
  initMQTT,
  getEnergyData,
  getOffsets,
  setOffset,
  isConnected,
  publish
};