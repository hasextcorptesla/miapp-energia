import express from 'express';
import { getDailyLogs, getMonthlyLogs, getYearlyLogs, getHourlyLogs, getReportData } from '../config/sqlite.js';

const router = express.Router();

router.get('/daily', (req, res) => {
  try {
    const { start, end } = req.query;
    const data = getDailyLogs(start, end);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/monthly', (req, res) => {
  try {
    const { year } = req.query;
    const data = getMonthlyLogs(parseInt(year) || new Date().getFullYear());
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/yearly', (req, res) => {
  try {
    const data = getYearlyLogs();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/hourly', (req, res) => {
  try {
    const { date } = req.query;
    const data = getHourlyLogs(date);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/report', async (req, res) => {
  try {
    const { start, end, format } = req.query;
    const data = getReportData(start, end);
    
    if (format === 'xlsx') {
      const XLSX = (await import('xlsx')).default;
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte.xlsx');
      res.send(buffer);
    } else {
      res.json({ success: true, data });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;