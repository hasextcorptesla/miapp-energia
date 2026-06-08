import noderedService from './nodered.js';
import db from '../config/sqlite.js';
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

  schedule.scheduleJob('0 3 * * *', () => {
    try {
      const medidor = db.prepare('SELECT * FROM medidor WHERE id = 1').get();
      if (!medidor) return;

      const ahora = new Date();
      const diaCierre = medidor.dia_cierre || 1;

      if (ahora.getDate() !== diaCierre) return;

      const mes = ahora.getMonth() + 1;
      const anio = ahora.getFullYear();

      let desdeFecha;
      if (mes === 1) {
        desdeFecha = `${anio - 1}-12-${String(diaCierre).padStart(2, '0')}`;
      } else {
        const mesAnt = String(mes - 1).padStart(2, '0');
        desdeFecha = `${anio}-${mesAnt}-${String(diaCierre).padStart(2, '0')}`;
      }

      const hastaFecha = `${anio}-${String(mes).padStart(2, '0')}-${String(diaCierre - 1).padStart(2, '0')}`;

      const consumoMes = db.prepare(`
        SELECT SUM(consumo_dia) as total FROM daily_logs WHERE date >= ? AND date <= ?
      `).get(desdeFecha, hastaFecha);

      const generacionMes = db.prepare(`
        SELECT SUM(solar_dia) as total FROM daily_logs WHERE date >= ? AND date <= ?
      `).get(desdeFecha, hastaFecha);

      const consumoDelMes = consumoMes?.total || 0;
      const generacionDelMes = generacionMes?.total || 0;
      const balance = consumoDelMes - generacionDelMes;

      if (balance < 0) {
        const nuevoExcedente = medidor.excedente_favor + Math.abs(balance);
        db.prepare('UPDATE medidor SET excedente_favor = ? WHERE id = 1').run(nuevoExcedente);
        console.log(`✓ Cierre automático: crédito +${Math.abs(balance).toFixed(1)} kWh (total: ${nuevoExcedente.toFixed(1)} kWh)`);
      } else if (balance > 0) {
        const nuevoExcedente = medidor.excedente_contra + balance;
        db.prepare('UPDATE medidor SET excedente_contra = ? WHERE id = 1').run(nuevoExcedente);
        console.log(`✓ Cierre automático: deuda +${balance.toFixed(1)} kWh (total: ${nuevoExcedente.toFixed(1)} kWh)`);
      } else {
        console.log(`✓ Cierre automático: balance 0, sin cambio`);
      }

      db.prepare('UPDATE medidor SET ultimo_cierre = ?, consumo_mes_actual = 0, generacion_mes_actual = 0 WHERE id = 1')
        .run(ahora.toISOString());
    } catch (error) {
      console.error('Error en cierre automático:', error.message);
    }
  });
  
  console.log('✓ Sistema de guardado iniciado (cada 5 min)');
}

export { getDailyLogs, getMonthlyLogs, getYearlyLogs, getHourlyLogs, getReportData };