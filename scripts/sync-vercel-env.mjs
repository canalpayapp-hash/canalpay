/**
 * Sincroniza variables de .env.local → Vercel (production + preview).
 * Uso: node scripts/sync-vercel-env.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env.local');
const KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

function parseEnv(file) {
  const out = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

if (!existsSync(envPath)) {
  console.error('Falta .env.local en la raíz del repo.');
  process.exit(1);
}

const env = parseEnv(envPath);
let missing = KEYS.filter((k) => !env[k]?.trim());
if (missing.length) {
  console.error('Faltan en .env.local:', missing.join(', '));
  process.exit(1);
}

// Si APP_URL es localhost, usar dominio probable de Vercel hasta el primer deploy.
if (/localhost|127\.0\.0\.1/i.test(env.NEXT_PUBLIC_APP_URL)) {
  env.NEXT_PUBLIC_APP_URL = 'https://canalpay-canal-pay.vercel.app';
  console.log('NEXT_PUBLIC_APP_URL → https://canalpay-canal-pay.vercel.app');
}

for (const key of KEYS) {
  const value = env[key];
  for (const target of ['production', 'preview']) {
    const r = spawnSync(
      'npx',
      ['vercel', 'env', 'add', key, target, '--force'],
      {
        cwd: root,
        input: value,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
      }
    );
    if (r.status !== 0) {
      console.error(`Error ${key} (${target}):`, r.stderr || r.stdout);
      process.exit(1);
    }
    console.log(`✓ ${key} → ${target}`);
  }
}

console.log('Variables listas en Vercel.');
