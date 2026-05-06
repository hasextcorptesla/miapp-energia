import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const DB_PATH = join(__dirname, '../../devices.json');

let devices = [];

function loadDB() {
  if (existsSync(DB_PATH)) {
    const data = readFileSync(DB_PATH, 'utf-8');
    devices = JSON.parse(data);
  } else {
    devices = [];
  }
}

function saveDB() {
  writeFileSync(DB_PATH, JSON.stringify(devices, null, 2));
}

loadDB();

router.get('/', (req, res) => {
  try {
    res.json({ success: true, devices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const device = devices.find(d => d.id === parseInt(req.params.id));
    res.json({ success: true, device });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, type, room, device_id, metadata } = req.body;
    
    const newDevice = {
      id: devices.length + 1,
      name,
      type,
      room,
      device_id,
      status: 'offline',
      state: 'off',
      metadata: metadata || {},
      created_at: new Date().toISOString()
    };
    
    devices.push(newDevice);
    saveDB();
    
    res.json({ success: true, deviceId: newDevice.id });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { name, type, room, status, state, metadata } = req.body;
    const id = parseInt(req.params.id);
    const index = devices.findIndex(d => d.id === id);
    
    if (index !== -1) {
      devices[index] = { ...devices[index], name, type, room, status, state, metadata };
      saveDB();
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    devices = devices.filter(d => d.id !== id);
    saveDB();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/:id/control', async (req, res) => {
  try {
    const { action, value } = req.body;
    const id = parseInt(req.params.id);
    const device = devices.find(d => d.id === id);
    
    if (!device) {
      return res.status(404).json({ success: false, error: 'Dispositivo no encontrado' });
    }
    
    let newState = device.state;
    if (action === 'toggle') {
      newState = device.state === 'on' ? 'off' : 'on';
    } else if (action === 'on') {
      newState = 'on';
    } else if (action === 'off') {
      newState = 'off';
    } else if (action === 'set' && value !== undefined) {
      newState = value;
    }
    
    const index = devices.findIndex(d => d.id === id);
    devices[index].state = newState;
    saveDB();
    
    res.json({ success: true, state: newState });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/type/:type', (req, res) => {
  try {
    const filtered = devices.filter(d => d.type === req.params.type);
    res.json({ success: true, devices: filtered });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;