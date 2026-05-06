import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../config/database.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const DB_PATH = join(__dirname, '../../users.json');
const METERS_PATH = join(__dirname, '../../meters.json');
const ALERTS_PATH = join(__dirname, '../../alerts.json');

let users = [];
let meters = [];
let alerts = [];

function loadUsers() {
  if (existsSync(DB_PATH)) {
    const data = readFileSync(DB_PATH, 'utf-8');
    users = JSON.parse(data).users || [];
  }
}

function saveUsers() {
  writeFileSync(DB_PATH, JSON.stringify({ users }, null, 2));
}

function loadMeters() {
  if (existsSync(METERS_PATH)) {
    const data = readFileSync(METERS_PATH, 'utf-8');
    meters = JSON.parse(data);
  }
}

function saveMeters() {
  writeFileSync(METERS_PATH, JSON.stringify(meters, null, 2));
}

function loadAlerts() {
  if (existsSync(ALERTS_PATH)) {
    const data = readFileSync(ALERTS_PATH, 'utf-8');
    alerts = JSON.parse(data);
  }
}

function saveAlerts() {
  writeFileSync(ALERTS_PATH, JSON.stringify(alerts, null, 2));
}

loadUsers();
loadMeters();
loadAlerts();

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Token requerido' });
  }
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Acceso solo admin' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Token inválido' });
  }
}

router.get('/meters', authenticate, (req, res) => {
  try {
    res.json({ success: true, meters });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/meters', authenticate, (req, res) => {
  try {
    const { name, type, provider } = req.body;
    
    const newMeter = {
      id: meters.length + 1,
      name,
      type,
      provider,
      provider_value: 0,
      local_value: 0,
      last_sync: null,
      created_at: new Date().toISOString()
    };
    
    meters.push(newMeter);
    saveMeters();
    res.json({ success: true, meterId: newMeter.id });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/meters/:id', authenticate, (req, res) => {
  try {
    const { provider_value, local_value } = req.body;
    const id = parseInt(req.params.id);
    const index = meters.findIndex(m => m.id === id);
    
    if (index !== -1) {
      meters[index].provider_value = provider_value;
      meters[index].local_value = local_value;
      meters[index].last_sync = new Date().toISOString();
      saveMeters();
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/meters/:id', authenticate, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    meters = meters.filter(m => m.id !== id);
    saveMeters();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/alerts', authenticate, (req, res) => {
  try {
    res.json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/alerts', authenticate, (req, res) => {
  try {
    const { type, message, threshold } = req.body;
    
    const newAlert = {
      id: alerts.length + 1,
      type,
      message,
      threshold,
      triggered: false,
      created_at: new Date().toISOString()
    };
    
    alerts.push(newAlert);
    saveAlerts();
    res.json({ success: true, alertId: newAlert.id });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/alerts/:id/acknowledge', authenticate, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = alerts.findIndex(a => a.id === id);
    
    if (index !== -1) {
      alerts[index].triggered = true;
      saveAlerts();
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/alerts/:id', authenticate, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    alerts = alerts.filter(a => a.id !== id);
    saveAlerts();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/stats', authenticate, (req, res) => {
  try {
    const devicesPath = join(__dirname, '../../devices.json');
    let deviceCount = 0;
    if (existsSync(devicesPath)) {
      const data = readFileSync(devicesPath, 'utf-8');
      deviceCount = JSON.parse(data).length;
    }
    
    const alertCount = alerts.filter(a => !a.triggered).length;
    
    res.json({ 
      success: true, 
      stats: { 
        devices: deviceCount, 
        meters: meters.length, 
        alerts: alertCount 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/users', authenticate, (req, res) => {
  try {
    const userList = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      created_at: u.created_at
    }));
    res.json({ success: true, users: userList });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/users', authenticate, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ success: false, error: 'Usuario ya existe' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: Date.now(),
      username,
      email,
      password: hashedPassword,
      role: 'user',
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers();
    res.json({ success: true, userId: newUser.id });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/users/:id', authenticate, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.role === 'admin') {
      return res.status(400).json({ success: false, error: 'No puedes eliminar admins' });
    }
    
    users = users.filter(u => u.id !== id);
    saveUsers();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/users/:id/password', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { password } = req.body;
    
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index].password = await bcrypt.hash(password, 10);
      saveUsers();
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;