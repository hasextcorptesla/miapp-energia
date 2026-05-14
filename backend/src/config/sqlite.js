import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_DIR = join(__dirname, '../../data');
const DB_PATH = join(DB_DIR, 'energia.db');

if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    solar_dia REAL DEFAULT 0,
    consumo_dia REAL DEFAULT 0,
    export_dia REAL DEFAULT 0,
    import_dia REAL DEFAULT 0,
    solar_peak REAL DEFAULT 0,
    consumo_peak REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS monthly_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    solar_mes REAL DEFAULT 0,
    consumo_mes REAL DEFAULT 0,
    export_mes REAL DEFAULT 0,
    import_mes REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, month)
  );

  CREATE TABLE IF NOT EXISTS yearly_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL UNIQUE,
    solar_year REAL DEFAULT 0,
    consumo_year REAL DEFAULT 0,
    export_year REAL DEFAULT 0,
    import_year REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS hourly_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    hour INTEGER NOT NULL,
    solar_hour REAL DEFAULT 0,
    consumo_hour REAL DEFAULT 0,
    export_hour REAL DEFAULT 0,
    import_hour REAL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, hour)
  );

  CREATE TABLE IF NOT EXISTS medidor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consumo_acumulado REAL DEFAULT 37380,
    generacion_acumulado REAL DEFAULT 29117,
    dia_cierre INTEGER DEFAULT 1,
    anio_actual INTEGER DEFAULT 2026,
    mes_actual INTEGER DEFAULT 5,
    consumo_mes_actual REAL DEFAULT 0,
    generacion_mes_actual REAL DEFAULT 0,
    excedente_favor REAL DEFAULT 0,
    excedente_contra REAL DEFAULT 0,
    ultimo_cierre TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

export function saveDailyLog(date, data) {
  const stmt = db.prepare(`
    INSERT INTO daily_logs (date, solar_dia, consumo_dia, export_dia, import_dia, solar_peak, consumo_peak)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      solar_dia = excluded.solar_dia,
      consumo_dia = excluded.consumo_dia,
      export_dia = excluded.export_dia,
      import_dia = excluded.import_dia,
      solar_peak = excluded.solar_peak,
      consumo_peak = excluded.consumo_peak
  `);
  
  return stmt.run(date, data.solar, data.consumo, data.export, data.import, data.solarPeak, data.consumoPeak);
}

export function saveHourlyLog(date, hour, data) {
  const stmt = db.prepare(`
    INSERT INTO hourly_logs (date, hour, solar_hour, consumo_hour, export_hour, import_hour)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(date, hour) DO UPDATE SET
      solar_hour = excluded.solar_hour,
      consumo_hour = excluded.consumo_hour,
      export_hour = excluded.export_hour,
      import_hour = excluded.import_hour
  `);
  
  return stmt.run(date, hour, data.solar, data.consumo, data.export, data.import);
}

export function getDailyLogs(startDate, endDate) {
  const stmt = db.prepare(`
    SELECT * FROM daily_logs 
    WHERE date >= ? AND date <= ?
    ORDER BY date DESC
  `);
  return stmt.all(startDate, endDate);
}

export function getMonthlyLogs(year) {
  const stmt = db.prepare(`
    SELECT * FROM monthly_logs 
    WHERE year = ?
    ORDER BY month DESC
  `);
  return stmt.all(year);
}

export function getYearlyLogs() {
  const stmt = db.prepare(`SELECT * FROM yearly_logs ORDER BY year DESC`);
  return stmt.all();
}

export function getHourlyLogs(date) {
  const stmt = db.prepare(`
    SELECT * FROM hourly_logs 
    WHERE date = ?
    ORDER BY hour ASC
  `);
  return stmt.all(date);
}

export function aggregateMonthly(year, month) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  
  const stmt = db.prepare(`
    SELECT 
      COALESCE(SUM(solar_dia), 0) as solar_mes,
      COALESCE(SUM(consumo_dia), 0) as consumo_mes,
      COALESCE(SUM(export_dia), 0) as export_mes,
      COALESCE(SUM(import_dia), 0) as import_mes
    FROM daily_logs 
    WHERE date >= ? AND date <= ?
  `);
  
  const result = stmt.get(startDate, endDate);
  
  const upsert = db.prepare(`
    INSERT INTO monthly_logs (year, month, solar_mes, consumo_mes, export_mes, import_mes)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(year, month) DO UPDATE SET
      solar_mes = excluded.solar_mes,
      consumo_mes = excluded.consumo_mes,
      export_mes = excluded.export_mes,
      import_mes = excluded.import_mes
  `);
  
  return upsert.run(year, month, result.solar_mes, result.consumo_mes, result.export_mes, result.import_mes);
}

export function aggregateYearly(year) {
  const stmt = db.prepare(`
    SELECT 
      COALESCE(SUM(solar_dia), 0) as solar_year,
      COALESCE(SUM(consumo_dia), 0) as consumo_year,
      COALESCE(SUM(export_dia), 0) as export_year,
      COALESCE(SUM(import_dia), 0) as import_year
    FROM daily_logs 
    WHERE date LIKE ?
  `);
  
  const result = stmt.get(`${year}%`);
  
  const upsert = db.prepare(`
    INSERT INTO yearly_logs (year, solar_year, consumo_year, export_year, import_year)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(year) DO UPDATE SET
      solar_year = excluded.solar_year,
      consumo_year = excluded.consumo_year,
      export_year = excluded.export_year,
      import_year = excluded.import_year
  `);
  
  return upsert.run(year, result.solar_year, result.consumo_year, result.export_year, result.import_year);
}

export function getReportData(startDate, endDate) {
  const stmt = db.prepare(`
    SELECT date, solar_dia, consumo_dia, export_dia, import_dia, 
           solar_peak, consumo_peak
    FROM daily_logs 
    WHERE date >= ? AND date <= ?
    ORDER BY date ASC
  `);
  return stmt.all(startDate, endDate);
}

export default db;