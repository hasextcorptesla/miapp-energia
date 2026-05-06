import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/database.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const DB_PATH = join(__dirname, '../../users.json');

let users = [];

function loadDB() {
  if (existsSync(DB_PATH)) {
    const data = readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    users = parsed.users || [];
  }
}

function saveDB() {
  writeFileSync(DB_PATH, JSON.stringify({ users }, null, 2));
}

loadDB();

router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ success: false, error: 'Usuario ya existe' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: Date.now(),
      username,
      password: hashedPassword,
      email,
      role: 'user',
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    saveDB();
    
    res.json({ success: true, userId: newUser.id });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/password', async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Contraseña actual incorrecta' });
    }
    
    user.password = await bcrypt.hash(newPassword, 10);
    saveDB();
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Usuario no encontrado' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      success: true, 
      token, 
      user: { id: user.id, username: user.username, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;