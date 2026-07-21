const Database = require('better-sqlite3');
const db = new Database('./data/energia.db');

const today = '2026-04-21';
const result = db.prepare(`
  INSERT INTO daily_logs (date, solar_dia, consumo_dia, export_dia, import_dia, solar_peak, consumo_peak)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(date) DO UPDATE SET
    solar_dia = excluded.solar_dia,
    consumo_dia = excluded.consumo_dia,
    export_dia = excluded.export_dia,
    import_dia = excluded.import_dia,
    solar_peak = excluded.solar_peak,
    consumo_peak = excluded.consumo_peak
`).run(today, 5.69, 14.84, 0.145, 14.77, 4522, 5597);

console.log('Datos insertados:', result.changes);
console.log('Verificando:');
console.log(db.prepare('SELECT * FROM daily_logs WHERE date = ?').get(today));
db.close();