/**
 * Fase 1 — Verifica tablas, seed y RPC público.
 */
import pg from 'pg';
import { readFileSync, existsSync } from 'fs';
import { resolve as pathResolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = pathResolve(__dirname, '..');
const { Client } = pg;

function loadEnvLocal() {
  const path = pathResolve(root, '.env.local');
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

function pgUrl(env) {
  const password = env.SUPABASE_DB_PASSWORD;
  if (!password) return null;
  return `postgresql://postgres.bsjvhewjhefntiasuxcx:${encodeURIComponent(password)}@aws-1-us-east-1.pooler.supabase.com:5432/postgres`;
}

const env = loadEnvLocal();
const url = (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const anonKey = env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Define SUPABASE_URL y SUPABASE_ANON_KEY en .env.local');
  process.exit(1);
}

const headers = {
  apikey: anonKey,
  Authorization: `Bearer ${anonKey}`,
};

async function rpc(fn, args) {
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(args),
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

console.log('CanalPay — Fase 1: verificación\n');
let failed = 0;

const dbUrl = pgUrl(env);
if (dbUrl) {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const { rows: m } = await client.query(
    `select name from public.merchants where name = 'Dulce Caracas'`
  );
  if (m.length) console.log('✓ Comercio Dulce Caracas');
  else {
    console.log('✗ Comercio no encontrado — ejecuta seed');
    failed++;
  }

  const { rows: p } = await client.query(`select role from public.profiles`);
  if (p.length >= 1) {
    console.log(`✓ Perfiles: ${p.length} (${p.map((r) => r.role).join(', ')})`);
    if (p.length < 3) {
      console.log('  ⚠ Crea usuarios Auth y vuelve a correr seed');
    }
  } else {
    console.log('✗ Sin perfiles');
    failed++;
  }

  const { rows: o } = await client.query(
    `select public_code from public.orders order by public_code`
  );
  if (o.length >= 4) {
    console.log(`✓ Órdenes demo: ${o.map((r) => r.public_code).join(', ')}`);
  } else {
    console.log('✗ Órdenes demo incompletas');
    failed++;
  }

  await client.end();
} else {
  console.log('⚠ Sin SUPABASE_DB_PASSWORD — saltando chequeos de tablas (RLS bloquea anon)');
  failed += 3;
}

const pub = await rpc('get_order_for_payment', { p_public_code: 'CP-1002' });
if (pub.ok && pub.data?.public_code === 'CP-1002') {
  console.log('✓ RPC get_order_for_payment (público)');
} else {
  console.log('✗ RPC público falló', pub.status, pub.data);
  failed++;
}

if (failed === 0) {
  console.log('\n✅ Fase 1 completa.');
  console.log('Login demo: admin@dulcecaracas.com / (tu DEMO_USER_PASSWORD)');
} else {
  console.log(`\n⚠ ${failed} chequeo(s) fallaron. Ver docs/FASE-1.md`);
  process.exit(1);
}
