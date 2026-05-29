/** Asegura full_name en perfiles demo móvil */
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

const client = new pg.Client({
  connectionString: `postgresql://postgres.bsjvhewjhefntiasuxcx:${encodeURIComponent(env.SUPABASE_DB_PASSWORD)}@aws-1-us-east-1.pooler.supabase.com:5432/postgres`,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const updates = [
  ['prueba@dulcecaracas.com', 'Usuario Prueba'],
  ['vendedor@dulcecaracas.com', 'Vendedor Demo'],
  ['cajero@dulcecaracas.com', 'Cajero Demo'],
];

for (const [email, name] of updates) {
  const r = await client.query(
    `update public.profiles p
     set full_name = $2, updated_at = now()
     from auth.users u
     where u.id = p.id and u.email = $1
     returning p.full_name`,
    [email, name]
  );
  console.log(r.rowCount ? `✓ ${email} → ${name}` : `· ${email} sin perfil`);
}

await client.end();
