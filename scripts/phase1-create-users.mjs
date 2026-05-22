/**
 * Fase 1 — Crea usuarios demo en Supabase Auth.
 *
 * Con SUPABASE_SERVICE_ROLE_KEY → API admin (recomendado, sin rate limit de signup).
 * Sin service role → signup público (puede fallar por 429 / dominio).
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

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
const anonKey = env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const password = env.DEMO_USER_PASSWORD;

if (!url || !password) {
  console.error('Define SUPABASE_URL y DEMO_USER_PASSWORD en .env.local');
  process.exit(1);
}

const users = [
  { email: 'admin@dulcecaracas.com', full_name: 'Admin Demo' },
  { email: 'vendedor@dulcecaracas.com', full_name: 'Vendedor Demo' },
  { email: 'cajero@dulcecaracas.com', full_name: 'Cajero Demo' },
];

async function createViaAdmin() {
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const u of users) {
    const { error } = await admin.auth.admin.createUser({
      email: u.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name },
    });

    if (!error) {
      console.log(`✓ ${u.email} creado (admin API)`);
    } else if (
      error.message?.toLowerCase().includes('already') ||
      error.status === 422
    ) {
      console.log(`· ${u.email} ya existe (ok)`);
    } else {
      console.log(`✗ ${u.email} —`, error.message);
    }
  }
}

async function createViaSignup() {
  if (!anonKey) {
    console.error('Falta SUPABASE_ANON_KEY para signup público');
    process.exit(1);
  }

  for (const u of users) {
    const res = await fetch(`${url}/auth/v1/signup`, {
      method: 'POST',
      headers: { apikey: anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: u.email, password }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log(`✓ ${u.email} creado`);
    } else if (
      body?.msg?.includes('already') ||
      body?.error_description?.includes('already')
    ) {
      console.log(`· ${u.email} ya existe (ok)`);
    } else {
      console.log(`✗ ${u.email} — ${res.status}`, body?.msg || body?.error_description || body);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
}

console.log('CanalPay — Fase 1: crear usuarios Auth\n');

if (serviceKey) {
  console.log('Usando SUPABASE_SERVICE_ROLE_KEY (admin)\n');
  await createViaAdmin();
} else {
  console.log('Sin service role → signup público (añade SUPABASE_SERVICE_ROLE_KEY para modo admin)\n');
  await createViaSignup();
}

console.log('\nSiguiente: node scripts/phase1-rerun-seed.mjs && node scripts/phase1-verify.mjs');
