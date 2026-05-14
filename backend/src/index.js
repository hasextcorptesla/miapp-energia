import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import devicesRouter from './api/devices.js';
import energyRouter from './api/energy.js';
import authRouter from './api/auth.js';
import adminRouter from './api/admin.js';
import foxessRouter from './api/foxess.js';
import noderedRouter from './api/nodered.js';
import reportsRouter from './api/reports.js';
import medidorRouter from './api/medidor.js';
import mqttService from './services/mqtt.js';
import noderedService from './services/nodered.js';
import { startDataLogging } from './services/dataLogger.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/energy', energyRouter);
app.use('/api/admin', adminRouter);
app.use('/api/foxess', foxessRouter);
app.use('/api/nodered', noderedRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/medidor', medidorRouter);

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  socket.on('subscribe', (topic) => {
    socket.join(topic);
  });
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

mqttService.initMQTT();
noderedService.startPolling(10000);
startDataLogging();

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`====================================`);
  console.log(`Servidor Miapp corriendo en http://localhost:${PORT}`);
  console.log(`====================================`);
  console.log(`Endpoints:`);
  console.log(`  GET  /api/energy/current`);
  console.log(`  GET  /api/energy/solar`);
  console.log(`  GET  /api/energy/daily`);
  console.log(`  GET  /api/nodered/data`);
  console.log(`  POST /api/nodered/data`);
  console.log(`  GET  /api/nodered/status`);
  console.log(`====================================`);
});

export { io };