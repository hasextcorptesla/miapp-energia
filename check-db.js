import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../../backend/data/energia.db');
const db = new Database(DB_PATH);

console.log('=== Tabla daily_logs ===');
const daily = db.prepare('SELECT * FROM daily_logs ORDER BY date DESC LIMIT 10').all();
console.log(daily);

console.log('\n=== Tabla hourly_logs ===');
const hourly = db.prepare('SELECT * FROM hourly_logs ORDER BY date DESC, hour DESC LIMIT 10').all();
console.log(hourly);

db.close();