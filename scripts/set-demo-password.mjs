/**
 * Establece contraseña demo para usuarios móvil (solo desarrollo).
 * Uso: node scripts/set-demo-password.mjs [password]
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const newPassword = process.argv[2] || '123456';

const envPath = resolve(root, '.env.local');
if (!existsSync(envPath)) {
  console.error('Falta .env.local');
  process.exit(1);
}

const env = {};
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i > 0) {
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[t.slice(0, i).trim()] = val;
  }
}

const url = (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Falta SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const emails = [
  'prueba@dulcecaracas.com',
  'vendedor@dulcecaracas.com',
  'cajero@dulcecaracas.com',
];

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error: listErr } = await admin.auth.admin.listUsers({ perPage: 200 });
if (listErr) {
  console.error(listErr.message);
  process.exit(1);
}

for (const email of emails) {
  const user = data.users.find((u) => u.email === email);
  if (!user) {
    console.log(`· ${email} — no existe (omite)`);
    continue;
  }
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true,
  });
  if (error) console.log(`✗ ${email}:`, error.message);
  else console.log(`✓ ${email}`);
}

console.log(`\nContraseña actualizada: ${newPassword}`);
