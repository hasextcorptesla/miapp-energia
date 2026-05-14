import express from 'express';
import db from '../config/sqlite.js';

const router = express.Router();

function getMedidorData() {
  let medidor = db.prepare('SELECT * FROM medidor WHERE id = 1').get();
  if (!medidor) {
    db.prepare(`INSERT INTO medidor (id, consumo_acumulado, generacion_acumulado, dia_cierre, anio_actual, mes_actual) VALUES (1, 37380, 29117, 1, 2026, 5)`).run();
    medidor = db.prepare('SELECT * FROM medidor WHERE id = 1').get();
    console.log('Medidor inicializado con valores:', medidor);
  }
  return medidor;
}

router.get('/data', (req, res) => {
  try {
    const medidor = getMedidorData();
    const ahora = new Date();
    const anioActual = ahora.getFullYear();
    const mesActual = ahora.getMonth() + 1;

    // Calcular fecha desde último cierre usando dia_cierre del medidor
    const diaCierre = medidor.dia_cierre;
    let desdeFecha;
    
    if (ahora.getDate() < diaCierre) {
      // Si estamos antes del día de cierre este mes, el cierre fue el mes pasado
      const mesPasado = mesActual === 1 ? 12 : mesActual - 1;
      const anioPasado = mesPasado === 12 ? anioActual - 1 : anioActual;
      desdeFecha = `${anioPasado}-${String(mesPasado).padStart(2, '0')}-${String(diaCierre).padStart(2, '0')}`;
    } else {
      // Si estamos después o igual al día de cierre, el cierre fue este mes
      desdeFecha = `${anioActual}-${String(mesActual).padStart(2, '0')}-${String(diaCierre).padStart(2, '0')}`;
    }

    // Obtener consumo y generación acumulados desde el último cierre
    const consumoDesdeCierre = db.prepare(`
      SELECT SUM(consumo_dia) as total FROM daily_logs
      WHERE date >= ? AND date <= ?
    `).get(desdeFecha, ahora.toISOString().split('T')[0]);

    const generacionDesdeCierre = db.prepare(`
      SELECT SUM(solar_dia) as total FROM daily_logs
      WHERE date >= ? AND date <= ?
    `).get(desdeFecha, ahora.toISOString().split('T')[0]);

    const consumoAcumuladoHoy = consumoDesdeCierre?.total || 0;
    const generacionAcumuladoHoy = generacionDesdeCierre?.total || 0;

    // Totales en tiempo real = base + acumulado desde último cierre
    const consumoTotalActual = medidor.consumo_acumulado + consumoAcumuladoHoy;
    const generacionTotalActual = medidor.generacion_acumulado + generacionAcumuladoHoy;

    // El consumo/generación del mes actual (desde día de cierre) es exactamente lo acumulado hoy
    const consumoMesActual = consumoAcumuladoHoy;
    const generacionMesActual = generacionAcumuladoHoy;

    const balance = consumoMesActual - generacionMesActual;

    res.json({
      success: true,
      data: {
        consumo_total: consumoTotalActual,
        generacion_total: generacionTotalActual,
        consumo_mes: consumoMesActual,
        generacion_mes: generacionMesActual,
        dia_cierre: medidor.dia_cierre,
        anio_actual: anioActual,
        mes_actual: mesActual,
        excedente_favor: medidor.excedente_favor,
        excedente_contra: medidor.excedente_contra,
        balance_mes: balance,
        mes_nombre: ahora.toLocaleString('es-ES', { month: 'long' })
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/ajustar', (req, res) => {
  try {
    const { consumo, generacion } = req.body;
    console.log('Ajustar - recibido:', req.body);

    const currentMedidor = getMedidorData();

    if (consumo !== undefined && consumo !== null && consumo !== '') {
      db.prepare('UPDATE medidor SET consumo_acumulado = ? WHERE id = 1').run(parseFloat(consumo));
    }
    if (generacion !== undefined && generacion !== null && generacion !== '') {
      db.prepare('UPDATE medidor SET generacion_acumulado = ? WHERE id = 1').run(parseFloat(generacion));
    }

    const medidor = getMedidorData();
    console.log('Ajustar - guardado. Nuevo valores:', medidor);
    res.json({ success: true, data: medidor, message: 'Valores ajustados correctamente' });
  } catch (error) {
    console.error('Error ajustar:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/configurar', (req, res) => {
  try {
    const { dia_cierre } = req.body;
    console.log('Configurar - dia_cierre recibido:', dia_cierre);

    const dia = parseInt(dia_cierre);
    if (isNaN(dia) || dia < 1 || dia > 31) {
      return res.status(400).json({ success: false, error: 'El día debe estar entre 1 y 31' });
    }

    db.prepare('UPDATE medidor SET dia_cierre = ? WHERE id = 1').run(dia);

    const medidor = getMedidorData();
    console.log('Configurar - guardado. Nuevo dia_cierre:', medidor.dia_cierre);
    res.json({ success: true, message: `Día de cierre configurado: ${dia}`, data: medidor });
  } catch (error) {
    console.error('Error configurar:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/grafico', (req, res) => {
  try {
    const { anio, mes } = req.query;
    const anioActual = parseInt(anio) || new Date().getFullYear();
    const mesActual = parseInt(mes) || new Date().getMonth() + 1;

    const mesStr = String(mesActual).padStart(2, '0');
    const diasEnMes = new Date(anioActual, mesActual, 0).getDate();

    const data = [];
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = `${anioActual}-${mesStr}-${String(dia).padStart(2, '0')}`;
      const registro = db.prepare(`
        SELECT solar_dia, consumo_dia FROM daily_logs WHERE date = ?
      `).get(fecha);

      data.push({
        dia,
        consumo: registro?.consumo_dia || 0,
        generacion: registro?.solar_dia || 0
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/historial', (req, res) => {
  try {
    const anio = parseInt(req.query.anio) || new Date().getFullYear();

    const meses = [];
    for (let mes = 1; mes <= 12; mes++) {
      const mesStr = String(mes).padStart(2, '0');
      const fechaInicio = `${anio}-${mesStr}-01`;
      const fechaFin = `${anio}-${mesStr}-28`;

      const consumo = db.prepare(`
        SELECT SUM(consumo_dia) as total FROM daily_logs
        WHERE date >= ? AND date <= ?
      `).get(fechaInicio, fechaFin);

      const generacion = db.prepare(`
        SELECT SUM(solar_dia) as total FROM daily_logs
        WHERE date >= ? AND date <= ?
      `).get(fechaInicio, fechaFin);

      meses.push({
        mes,
        nombre: new Date(anio, mes - 1).toLocaleString('es-ES', { month: 'long' }),
        consumo: consumo?.total || 0,
        generacion: generacion?.total || 0,
        balance: (consumo?.total || 0) - (generacion?.total || 0)
      });
    }

    res.json({ success: true, data: meses, anio });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/cerrar-mes', (req, res) => {
  try {
    const medidor = getMedidorData();
    const ahora = new Date();

    const anio = ahora.getFullYear();
    const mes = ahora.getMonth() + 1;

    const desdeFecha = `${anio}-${String(mes).padStart(2, '0')}-01`;

    const consumoMes = db.prepare(`
      SELECT SUM(consumo_dia) as total FROM daily_logs WHERE date >= ?
    `).get(desdeFecha);

    const generacionMes = db.prepare(`
      SELECT SUM(solar_dia) as total FROM daily_logs WHERE date >= ?
    `).get(desdeFecha);

    const consumoDelMes = consumoMes?.total || 0;
    const generacionDelMes = generacionMes?.total || 0;
    const balance = consumoDelMes - generacionDelMes;

    if (balance < 0) {
      const nuevoExcedente = medidor.excedente_favor + Math.abs(balance);
      db.prepare('UPDATE medidor SET excedente_favor = ?, mes_actual = ?, anio_actual = ? WHERE id = 1')
        .run(nuevoExcedente, mes, anio);
    } else if (balance > 0) {
      const nuevoExcedente = medidor.excedente_contra + balance;
      db.prepare('UPDATE medidor SET excedente_contra = ?, mes_actual = ?, anio_actual = ? WHERE id = 1')
        .run(nuevoExcedente, mes, anio);
    }

    db.prepare('UPDATE medidor SET ultimo_cierre = ?, consumo_mes_actual = 0, generacion_mes_actual = 0 WHERE id = 1')
      .run(ahora.toISOString());

    res.json({
      success: true,
      message: `Mes cerrado. Balance: ${balance.toFixed(2)} kWh`,
      balance
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;