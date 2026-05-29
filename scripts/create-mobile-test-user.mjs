/**
 * Crea o actualiza usuario de prueba para Expo Go (vendedor con comercio asignado).
 * Usa SUPABASE_SERVICE_ROLE_KEY y DEMO_USER_PASSWORD de .env.local
 */
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const TEST_EMAIL = 'prueba@dulcecaracas.com';
const TEST_NAME = 'Usuario Prueba Móvil';

function loadEnvLocal() {
  const path = resolve(root, '.env.local');
  if (!existsSync(path)) {
    console.error('Falta .env.local');
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) {
      let val = t.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      env[t.slice(0, i).trim()] = val;
    }
  }
  return env;
}

const env = loadEnvLocal();
const url = (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const password = env.DEMO_USER_PASSWORD;
const dbPassword = env.SUPABASE_DB_PASSWORD;

if (!url || !serviceKey || !password) {
  console.error('Requiere SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY y DEMO_USER_PASSWORD en .env.local');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let userId;

const { data: created, error: createErr } = await admin.auth.admin.createUser({
  email: TEST_EMAIL,
  password,
  email_confirm: true,
  user_metadata: { full_name: TEST_NAME },
});

if (!createErr && created?.user) {
  userId = created.user.id;
  console.log(`✓ Usuario Auth creado: ${TEST_EMAIL}`);
} else if (
  createErr?.message?.toLowerCase().includes('already') ||
  createErr?.status === 422
) {
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
  const found = list?.users?.find((u) => u.email === TEST_EMAIL);
  if (!found) {
    console.error('✗ Email ya existe pero no se encontró en listUsers');
    process.exit(1);
  }
  userId = found.id;
  await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
  console.log(`✓ Usuario Auth actualizado (password reset): ${TEST_EMAIL}`);
} else {
  console.error('✗ Auth:', createErr.message);
  process.exit(1);
}

if (!dbPassword) {
  console.log('\n⚠ Sin SUPABASE_DB_PASSWORD: perfil no vinculado. Ejecuta npm run phase1:users y phase1-rerun-seed.');
  console.log('\n--- Credenciales móvil ---');
  console.log(`Email:    ${TEST_EMAIL}`);
  console.log(`Password: (valor de DEMO_USER_PASSWORD en .env.local)`);
  process.exit(0);
}

const pgUrl = `postgresql://postgres.bsjvhewjhefntiasuxcx:${encodeURIComponent(dbPassword)}@aws-1-us-east-1.pooler.supabase.com:5432/postgres`;
const client = new pg.Client({ connectionString: pgUrl, ssl: { rejectUnauthorized: false } });
await client.connect();

const merchant = await client.query(
  `select id from public.merchants where name = 'Dulce Caracas' limit 1`
);
const branch = await client.query(
  `select id from public.branches where merchant_id = $1 and name = 'Chacao' limit 1`,
  [merchant.rows[0]?.id]
);

if (!merchant.rows[0] || !branch.rows[0]) {
  console.error('✗ Falta comercio demo Dulce Caracas. Ejecuta: node scripts/phase1-rerun-seed.mjs');
  await client.end();
  process.exit(1);
}

await client.query(
  `
  insert into public.profiles (id, merchant_id, branch_id, full_name, role, status)
  values ($1, $2, $3, $4, 'seller', 'active')
  on conflict (id) do update set
    merchant_id = excluded.merchant_id,
    branch_id = excluded.branch_id,
    full_name = excluded.full_name,
    role = excluded.role,
    status = excluded.status
  `,
  [userId, merchant.rows[0].id, branch.rows[0].id, TEST_NAME]
);

await client.end();

console.log('✓ Perfil vendedor → Dulce Caracas / Chacao');
console.log('\n--- Credenciales para Expo Go (login) ---');
console.log(`Email:    ${TEST_EMAIL}`);
console.log(`Password: (misma que DEMO_USER_PASSWORD en .env.local)`);
console.log('\nTambién puedes usar: vendedor@dulcecaracas.com con la misma contraseña.');
