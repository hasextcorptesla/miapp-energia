import express from 'express';
import FoxESSService from '../services/foxess.js';

const router = express.Router();

const foxess = new FoxESSService();

router.post('/config', (req, res) => {
  try {
    const { apiKey, deviceSN } = req.body;
    foxess.apiKey = apiKey;
    foxess.deviceSN = deviceSN;
    res.json({ success: true, message: 'FoxES configurado' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/devices', async (req, res) => {
  try {
    const data = await foxess.getDeviceList();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/realtime', async (req, res) => {
  try {
    const sn = req.query.sn || foxess.deviceSN;
    const data = await foxess.getRealTimeData(sn);
    const parsed = foxess.parseRealTimeData(data);
    res.json({ success: true, data: parsed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const sn = req.query.sn || foxess.deviceSN;
    const end = Date.now();
    const begin = end - 24 * 60 * 60 * 1000;
    const data = await foxess.getHistoryData(sn, begin, end);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/generation', async (req, res) => {
  try {
    const sn = req.query.sn || foxess.deviceSN;
    const data = await foxess.getTodayGeneration(sn);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/battery', async (req, res) => {
  try {
    const sn = req.query.sn || foxess.deviceSN;
    const data = await foxess.getBatterySOC(sn);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;