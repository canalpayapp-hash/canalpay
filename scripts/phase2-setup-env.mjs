/**
 * Copia variables públicas de .env.local raíz → admin y mobile
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function parseEnv(path) {
  if (!existsSync(path)) return {};
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

const env = parseEnv(resolve(root, '.env.local'));
const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!url || !anon) {
  console.error('Falta SUPABASE URL/anon en .env.local');
  process.exit(1);
}

const adminEnv = `NEXT_PUBLIC_SUPABASE_URL=${url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon}
NEXT_PUBLIC_APP_URL=${appUrl}
`;

const mobileEnv = `EXPO_PUBLIC_SUPABASE_URL=${url}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${anon}
EXPO_PUBLIC_APP_URL=${appUrl}
`;

writeFileSync(resolve(root, 'admin/.env.local'), adminEnv, 'utf8');
writeFileSync(resolve(root, 'mobile/.env'), mobileEnv, 'utf8');
console.log('✓ admin/.env.local');
console.log('✓ mobile/.env');
