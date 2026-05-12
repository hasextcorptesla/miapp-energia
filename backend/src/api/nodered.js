import express from 'express';
import { io } from '../index.js';
import mqttService from '../services/mqtt.js';
import noderedService from '../services/nodered.js';

const router = express.Router();

router.post('/data', async (req, res) => {
  try {
    const { entityId, action } = req.body;
    
    if (entityId && (action === 'on' || action === 'off')) {
      const result = await noderedService.controlSwitch(entityId, action);
      res.json(result);
      return;
    }
    
    if (entityId === 'script.encender_luces') {
      const switches = [
        'switch.sonoff_10006944a0',
        'switch.sonoff_1000689d99',
        'switch.sonoff_1000d10979',
        'switch.sonoff_10014560db'
      ];
      for (const sw of switches) {
        await noderedService.controlSwitch(sw, 'on');
      }
      res.json({ success: true });
      return;
    }
    
    if (entityId === 'script.apagar_luces') {
      const switches = [
        'switch.sonoff_10006944a0',
        'switch.sonoff_1000689d99',
        'switch.sonoff_1000d10979',
        'switch.sonoff_10014560db',
        'switch.luces_interruptor_1',
        'switch.luces_interruptor_2',
        'switch.luces_interruptor_3'
      ];
      for (const sw of switches) {
        await noderedService.controlSwitch(sw, 'off');
      }
      res.json({ success: true });
      return;
    }
    
    const data = req.body;
    io.emit('energy:update', data);
    io.emit('nodered:data', data);
    console.log('Datos recibidos de Node-RED:', data);
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/data', (req, res) => {
  const mqttData = mqttService.getEnergyData();
  const nodeRedData = noderedService.getEnergyData();
  
  const combinedData = {
    potencia: mqttData.potencia || nodeRedData.potencia || 0,
    solarPower: mqttData.solarPower || nodeRedData.solarPower || 0,
    batterySoc: mqttData.batterySoc || nodeRedData.batterySoc || 0,
    gridConsumption: mqttData.gridConsumption || nodeRedData.gridConsumption || 0,
    voltage: mqttData.voltage || nodeRedData.voltage || 220,
    current: mqttData.current || nodeRedData.current || 0,
    importado: mqttData.importado || nodeRedData.importado || 0,
    exportado: mqttData.exportado || nodeRedData.exportado || 0,
    solarDia: mqttData.solarDia || nodeRedData.solarDia || 0,
    consumoDia: mqttData.consumoDia || nodeRedData.consumoDia || 0,
    exportDia: nodeRedData.exportDia || 0,
    importDia: nodeRedData.importDia || 0,
    aireSalon: mqttData.aireSalon || nodeRedData.aireSalon || 0,
    aireRecepcion: mqttData.aireRecepcion || nodeRedData.aireRecepcion || 0,
    aireDiseno: mqttData.aireDiseno || nodeRedData.aireDiseno || 0,
    energiaExportada: nodeRedData.energiaExportada || 0,
    energiaImportada: nodeRedData.energiaImportada || 0,
    generadoMensual: nodeRedData.generadoMensual || 0,
    activaMensual: nodeRedData.activaMensual || 0,
    consumoPagar: nodeRedData.consumoPagar || 0,
    excedenteAnual: nodeRedData.excedenteAnual || 0,
    timestamp: nodeRedData.timestamp || new Date().toISOString()
  };
  
  res.json({ success: true, data: combinedData });
});

router.get('/energy/current', (req, res) => {
  const data = noderedService.getEnergyData();
  let acData = noderedService.getAirConditioners();
  
  if (acData && !Array.isArray(acData)) {
    acData = Object.values(acData)
  }
  
  const getAcPower = (id) => acData?.find(a => a.id === id)?.power || 0
  
  const aireSalon = getAcPower('salon')
  const aireRecepcion = getAcPower('recepcion')
  const aireDiseno = getAcPower('diseno')
  const aireLaboratorio = getAcPower('laboratorio')
  const totalAires = aireSalon + aireRecepcion + aireDiseno + aireLaboratorio

  res.json({
    success: true,
    consumoActual: data.potencia,
    solarGenerado: data.solarPower,
    gridConsumption: data.gridConsumption,
    batterySoc: data.batterySoc,
    solarDia: data.solarDia,
    consumoDia: data.consumoDia,
    exportDia: data.exportDia,
    importDia: data.importDia,
    importado: data.importado || 0,
    exportado: data.exportado || 0,
    aireSalon: aireSalon,
    aireRecepcion: aireRecepcion,
    aireDiseno: aireDiseno,
    aireLaboratorio: aireLaboratorio,
    totalAires: totalAires
  });
});

router.get('/status', (req, res) => {
  res.json({ 
    success: true, 
    mqttConnected: mqttService.isConnected(),
    offsets: mqttService.getOffsets(),
    nodeRedConnected: true
  });
});

router.post('/offset', (req, res) => {
  try {
    const { key, value } = req.body;
    const success = mqttService.setOffset(key, parseFloat(value));
    
    if (success) {
      res.json({ success: true, offsets: mqttService.getOffsets() });
    } else {
      res.status(400).json({ success: false, error: 'Offset no válido' });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/devices', (req, res) => {
  try {
    const { deviceId, state, type, value } = req.body;
    mqttService.publish(`control/${deviceId}`, JSON.stringify({ state, type, value }));
    io.emit('device:control', { deviceId, state, type, value });
    console.log('Comando enviado a dispositivo:', { deviceId, state, type, value });
    res.json({ success: true, message: 'Comando enviado' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/lights', (req, res) => {
  const lights = noderedService.getLights();
  res.json({ success: true, lights });
});

router.post('/light/control', async (req, res) => {
  console.log('=== LIGHT CONTROL ROUTE CALLED ===');
  console.log('Body:', req.body);
  const { entity_id, action } = req.body;

  if (!entity_id) {
    console.log('No entity_id provided');
    return res.json({ success: false, error: 'No entity_id provided' });
  }

  try {
    console.log('Calling controlSwitch:', entity_id, action);
    const result = await noderedService.controlSwitch(entity_id, action);
    console.log('Result:', result);
    res.json(result);
  } catch (err) {
    console.error('Error in route:', err);
    res.json({ success: false, error: err.message });
  }
});

router.get('/air-conditioners', (req, res) => {
  const ac = noderedService.getAirConditioners();
  res.json({ success: true, airConditioners: ac });
});

router.post('/ac/control', async (req, res) => {
  const { id, action } = req.body;
  try {
    const acMap = {
      'salon': 'switch.aire3',
      'recepcion': 'switch.aire1',
      'diseno': 'switch.aire2',
      'laboratorio': 'switch.aire4'
    };
    const entityId = acMap[id];
    if (!entityId) {
      return res.json({ success: false, error: 'AC no encontrado' });
    }
    const result = await noderedService.controlSwitch(entityId, action);
    res.json(result);
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.post('/ac/temperature', async (req, res) => {
  const { id, temperature } = req.body;
  try {
    const tempMap = {
      'salon': { 24: 'switch.temp24_salon3', 25: 'switch.temp25_salon3', 26: 'switch.temp26_salon3' },
      'recepcion': { 24: 'switch.temp_24_recepcion', 25: 'switch.temp_25_recepcion', 26: 'switch.temp_26_recepcion' },
      'diseno': { 24: 'switch.temp24_aire2', 25: 'switch.temp25_aire2', 26: 'switch.temp26_aire2' },
      'laboratorio': { 24: 'switch.temp_24_aire4', 25: 'switch.temp_25_aire4', 26: 'switch.temp_26_aire4' }
    };
    const tempSwitches = tempMap[id];
    if (!tempSwitches || !tempSwitches[temperature]) {
      return res.json({ success: false, error: 'Temperatura no disponible para este AC' });
    }
    for (const [temp, entityId] of Object.entries(tempSwitches)) {
      await noderedService.controlSwitch(entityId, parseInt(temp) === temperature ? 'on' : 'off')
    }
    res.json({ success: true, message: `Temperatura establecida a ${temperature}°C` });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

export default router;