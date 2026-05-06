import express from 'express';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const NODERED_PATH = join(__dirname, '../../../nodered-data.json');

let noderedData = {
  power: 0,
  voltage: 220,
  current: 0,
  energyToday: 0,
  solarPower: 0,
  batterySoc: 0,
  gridConsumption: 0,
  loadsPower: 0,
  timestamp: null
};

function loadNodeRedData() {
  try {
    if (existsSync(NODERED_PATH)) {
      const data = readFileSync(NODERED_PATH, 'utf-8');
      noderedData = JSON.parse(data);
    }
  } catch (e) {
    console.log('No hay datos de Node-RED aún');
  }
}

loadNodeRedData();

router.get('/current', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      power: noderedData.power || 1250, 
      voltage: noderedData.voltage || 220, 
      current: noderedData.current || 5.68,
      powerFactor: 0.95,
      timestamp: noderedData.timestamp || new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/history/:range', async (req, res) => {
  try {
    const { range } = req.params;
    const mockData = generateMockData(range);
    res.json({ success: true, data: mockData, range });
  } catch (error) {
    const mockData = generateMockData(req.params.range);
    res.json({ success: true, data: mockData, range: req.params.range });
  }
});

router.get('/daily', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      today: noderedData.energyToday || 12.5, 
      yesterday: (noderedData.energyToday || 12.5) - 2.5,
      week: (noderedData.energyToday || 12.5) * 7,
      month: (noderedData.energyToday || 12.5) * 30,
      year: (noderedData.energyToday || 12.5) * 365
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/data', async (req, res) => {
  try {
    const { 
      power, 
      voltage, 
      current, 
      energyToday,
      solarPower,
      batterySoc,
      gridConsumption,
      loadsPower 
    } = req.body;
    
    noderedData = {
      power: power ?? noderedData.power,
      voltage: voltage ?? noderedData.voltage,
      current: current ?? noderedData.current,
      energyToday: energyToday ?? noderedData.energyToday,
      solarPower: solarPower ?? noderedData.solarPower,
      batterySoc: batterySoc ?? noderedData.batterySoc,
      gridConsumption: gridConsumption ?? noderedData.gridConsumption,
      loadsPower: loadsPower ?? noderedData.loadsPower,
      timestamp: new Date().toISOString()
    };
    
    console.log('Datos de energía actualizados:', noderedData);
    res.json({ success: true, data: noderedData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/solar', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        solarPower: noderedData.solarPower || 0,
        batterySoc: noderedData.batterySoc || 0,
        gridConsumption: noderedData.gridConsumption || 0,
        loadsPower: noderedData.loadsPower || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function generateMockData(range) {
  const data = [];
  const now = new Date();
  let points, interval;
  
  switch (range) {
    case 'day':
      points = 24;
      interval = 3600000;
      break;
    case 'week':
      points = 7;
      interval = 86400000;
      break;
    case 'month':
      points = 30;
      interval = 86400000;
      break;
    case 'year':
      points = 12;
      interval = 2592000000;
      break;
    default:
      points = 24;
      interval = 3600000;
  }
  
  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * interval);
    const baseValue = (noderedData.power || 1000) + Math.random() * 500 - 250;
    data.push({
      timestamp: time.toISOString(),
      power: Math.round(Math.max(0, baseValue) * 10) / 10,
      energy: Math.round((Math.max(0, baseValue) * (interval / 3600000)) * 10) / 10
    });
  }
  
  return data;
}

export default router;