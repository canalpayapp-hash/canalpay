import pg from 'pg';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = {};
for (const line of readFileSync(resolve(root, '.env.local'), 'utf8').split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i > 0) env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

const url = `postgresql://postgres.bsjvhewjhefntiasuxcx:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@aws-1-us-east-1.pooler.supabase.com:5432/postgres`;
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
const sql = readFileSync(
  resolve(root, 'supabase/migrations/20260522000003_seed_demo.sql'),
  'utf8'
).replace(/^\uFEFF/, '');
await client.query(sql);
const { rows } = await client.query(`
  select
    (select count(*)::int from public.merchants) as merchants,
    (select count(*)::int from public.orders) as orders,
    (select count(*)::int from public.profiles) as profiles,
    (select count(*)::int from auth.users) as auth_users
`);
console.log(rows[0]);
await client.end();
