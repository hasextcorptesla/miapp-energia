const Database = require('better-sqlite3');
const db = new Database('./data/energia.db');
console.log('=== daily_logs ===');
console.log(db.prepare('SELECT * FROM daily_logs ORDER BY date DESC').all());
db.close();