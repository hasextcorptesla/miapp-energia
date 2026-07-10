import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';
import supabase from './config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT = join(__dirname, '../..');
const BACKUP_ROOT = join(PROJECT, 'Backup');
const date = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
const TEMP_DIR = join(BACKUP_ROOT, date);
const ZIP_PATH = join(BACKUP_ROOT, `backup_${date}.zip`);

async function backup() {
  console.log('=== Backup MiApp ===');
  console.log(`Fecha: ${new Date().toLocaleString()}\n`);

  mkdirSync(TEMP_DIR, { recursive: true });

  let copied = 0;
  let errors = 0;

  // 1. Exportar usuarios de Supabase
  console.log('1. Exportando usuarios de Supabase...');
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const usersPath = join(TEMP_DIR, 'backend', 'users_supabase.json');
    mkdirSync(join(TEMP_DIR, 'backend'), { recursive: true });
    writeFileSync(usersPath, JSON.stringify({ users }, null, 2));
    console.log(`   ✅ ${users.length} usuarios exportados de Supabase`);
    copied++;
  } catch (err) {
    console.log(`   ❌ Error exportando de Supabase: ${err.message}`);
    errors++;
  }

  // 2. Backup seguro de SQLite
  console.log('2. Backup seguro de SQLite...');
  const dbPath = join(PROJECT, 'backend', 'data', 'energia.db');
  const dbBackupDir = join(TEMP_DIR, 'backend', 'data');
  mkdirSync(dbBackupDir, { recursive: true });

  if (existsSync(dbPath)) {
    try {
      const Database = (await import('better-sqlite3')).default;
      const db = new Database(dbPath, { readonly: true });
      const backupPath = join(dbBackupDir, 'energia.db');
      await db.backup(backupPath);
      db.close();
      console.log(`   ✅ SQLite backup seguro creado`);
      copied++;
    } catch (err) {
      console.log(`   ❌ Error en backup SQLite: ${err.message}`);
      try {
        const { copyFileSync } = await import('fs');
        copyFileSync(dbPath, join(dbBackupDir, 'energia.db'));
        console.log(`   ⚠️ SQLite backup por copia directa (fallback)`);
        copied++;
      } catch (err2) {
        console.log(`   ❌ Error copiando SQLite: ${err2.message}`);
        errors++;
      }
    }
  } else {
    console.log(`   ⚠️ Archivo SQLite no encontrado`);
  }

  // 3. Copiar archivos de configuración
  console.log('3. Copiando archivos de configuración...');
  const files = [
    'backend/users.json',
    'backend/meters.json',
    'backend/alerts.json',
    'backend/devices.json',
    'backend/.env',
    'backend/package.json',
    'backend/src/api/auth.js',
    'backend/src/api/admin.js',
    'backend/src/index.js',
    'backend/src/config/supabase.js',
    'backend/src/config/database.js',
    'frontend/src/views/Dashboard.vue',
    'frontend/src/views/Energia.vue',
    'frontend/src/views/Medidor.vue',
    'frontend/src/views/Admin.vue',
    'frontend/src/views/Perfil.vue',
    'frontend/src/views/Reportes.vue',
    'frontend/src/views/Login.vue',
    'frontend/src/App.vue',
    'frontend/src/style.css',
    'frontend/src/router/index.js',
    'frontend/vite.config.js',
    'frontend/tailwind.config.js',
    'frontend/package.json',
    'frontend/index.html',
    'vercel.json',
    '.gitignore'
  ];

  for (const file of files) {
    const src = join(PROJECT, file);
    const dest = join(TEMP_DIR, file);
    if (existsSync(src)) {
      mkdirSync(dirname(dest), { recursive: true });
      const { copyFileSync } = await import('fs');
      copyFileSync(src, dest);
      copied++;
    }
  }
  console.log(`   ✅ ${copied - 2} archivos copiados`);

  // 4. Crear ZIP
  console.log('4. Creando ZIP...');
  try {
    execSync(`powershell -Command "Compress-Archive -Path '${TEMP_DIR}\\*' -DestinationPath '${ZIP_PATH}' -Force"`, { stdio: 'pipe' });
    rmSync(TEMP_DIR, { recursive: true });
    console.log(`   ✅ ZIP creado: ${ZIP_PATH}`);
  } catch (err) {
    console.log(`   ❌ Error creando ZIP: ${err.message}`);
    errors++;
  }

  // 5. Limpiar backups viejos (mantener últimos 8 = 2 meses)
  console.log('5. Limpiando backups viejos...');
  const allBackups = readdirSync(BACKUP_ROOT)
    .filter(f => f.startsWith('backup_') && f.endsWith('.zip'))
    .sort();

  if (allBackups.length > 8) {
    const toDelete = allBackups.slice(0, allBackups.length - 8);
    for (const old of toDelete) {
      rmSync(join(BACKUP_ROOT, old));
    }
    console.log(`   ✅ ${toDelete.length} backups viejos eliminados`);
  } else {
    console.log(`   ✅ ${allBackups.length} backups (límite: 8)`);
  }

  // 6. Log
  const logEntry = `${new Date().toISOString()} | Copiados: ${copied} | Errores: ${errors} | ZIP: ${ZIP_PATH}\n`;
  const logPath = join(BACKUP_ROOT, 'backup.log');
  const { appendFileSync } = await import('fs');
  appendFileSync(logPath, logEntry);

  console.log(`\n=== Backup completado: ${copied} archivos, ${errors} errores ===`);
}

backup().catch(err => {
  console.error('Error fatal en backup:', err.message);
  process.exit(1);
});
