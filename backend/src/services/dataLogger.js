import noderedService from './nodered.js';
import { saveDailyLog, saveHourlyLog, aggregateMonthly, aggregateYearly, getDailyLogs, getMonthlyLogs, getYearlyLogs, getHourlyLogs, getReportData } from '../config/sqlite.js';
import schedule from 'node-schedule';

let lastDate = '';
let lastHour = -1;

export function startDataLogging() {
  console.log('Iniciando guardado automático de datos...');
  
  setInterval(() => {
    try {
      const data = noderedService.getEnergyData();
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const hour = now.getHours();
      
      const logData = {
        solar: data.solarDia || 0,
        consumo: data.consumoDia || 0,
        export: data.exportDia || 0,
        import: data.importDia || 0,
        solarPeak: Math.max(data.solarPower || 0),
        consumoPeak: Math.max(data.potencia || 0)
      };
      
      if (dateStr !== lastDate) {
        if (lastDate) {
          const prevDate = new Date(now);
          prevDate.setDate(prevDate.getDate() - 1);
          const prevDateStr = prevDate.toISOString().split('T')[0];
          const yesterdayData = noderedService.getEnergyData();
          
          saveDailyLog(prevDateStr, {
            solar: yesterdayData.solarDia || 0,
            consumo: yesterdayData.consumoDia || 0,
            export: yesterdayData.exportDia || 0,
            import: yesterdayData.importDia || 0,
            solarPeak: yesterdayData.solarPower || 0,
            consumoPeak: yesterdayData.potencia || 0
          });
          console.log(`✓ Guardado diario: ${prevDateStr}`);
        }
        lastDate = dateStr;
      }
      
      saveDailyLog(dateStr, logData);
      console.log(`✓ Guardando datos: Solar=${logData.solar}, Consumo=${logData.consumo}`);
      
      if (hour !== lastHour && hour >= 0) {
        const importPower = data.importado > 0 ? data.importado : 0
        const exportPower = data.exportado > 0 ? data.exportado : 0
        saveHourlyLog(dateStr, hour, {
          solar: data.solarPower || 0,
          consumo: data.potencia || 0,
          export: exportPower,
          import: importPower
        });
        lastHour = hour;
        console.log(`✓ Guardado hourly: ${dateStr} hora ${hour} - Import:${importPower}W, Export:${exportPower}W`);
      }
      
    } catch (error) {
      console.error('Error guardando datos:', error.message);
    }
  }, 300000);
  
  schedule.scheduleJob('0 0 1 * *', () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    aggregateMonthly(year, month);
    console.log(`✓ Agregado mensual: ${month}/${year}`);
  });
  
  schedule.scheduleJob('0 0 1 1 *', () => {
    const year = new Date().getFullYear();
    aggregateYearly(year);
    console.log(`✓ Agregado anual: ${year}`);
  });
  
  console.log('✓ Sistema de guardado iniciado (cada 5 min)');
}

export { getDailyLogs, getMonthlyLogs, getYearlyLogs, getHourlyLogs, getReportData };