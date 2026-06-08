import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/database.js';
import supabase from '../config/supabase.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();
    
    if (existing) {
      return res.status(400).json({ success: false, error: 'Usuario ya existe' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        username,
        password: hashedPassword,
        email,
        role: 'user'
      }])
      .select('id')
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, userId: data.id });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/password', async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    
    const { data: user, error: findErr } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (findErr || !user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Contraseña actual incorrecta' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', user.id);
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const { data: user, error: findErr } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (findErr || !user) {
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