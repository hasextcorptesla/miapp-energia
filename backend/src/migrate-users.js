import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import supabase from './config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, '../users.json');

async function migrate() {
  console.log('=== Migración de usuarios a Supabase ===\n');

  const data = readFileSync(DB_PATH, 'utf-8');
  const { users } = JSON.parse(data);

  console.log(`Encontrados ${users.length} usuarios en users.json\n`);

  for (const user of users) {
    try {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', user.username)
        .single();

      if (existing) {
        console.log(`⚠️  "${user.username}" ya existe en Supabase, saltando...`);
        continue;
      }

      const { error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          username: user.username,
          password: user.password,
          email: user.email,
          role: user.role || 'user',
          created_at: user.created_at || new Date().toISOString()
        });

      if (error) {
        console.log(`❌ Error con "${user.username}": ${error.message}`);
      } else {
        console.log(`✅ "${user.username}" migrado (rol: ${user.role || 'user'})`);
      }
    } catch (err) {
      console.log(`❌ Error con "${user.username}": ${err.message}`);
    }
  }

  console.log('\n=== Migración completada ===');
}

migrate();
