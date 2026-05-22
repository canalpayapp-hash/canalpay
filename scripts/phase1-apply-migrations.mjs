/**
 * Aplica migraciones Fase 1 contra Postgres remoto.
 * Requiere DATABASE_URL en .env.local (Supabase → Settings → Database → Connection string URI)
 *
 * Uso: npm run phase1:apply
 */
import pg from 'pg';
import { readFileSync, existsSync } from 'fs';
import { resolve as pathResolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = pathResolve(__dirname, '..');
const { Client } = pg;

function loadEnvLocal() {
  const path = pathResolve(root, '.env.local');
  if (!existsSync(path)) return {};
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

function buildDatabaseUrl(env) {
  const ref = 'bsjvhewjhefntiasuxcx';
  const host = 'aws-1-us-east-1.pooler.supabase.com';

  // Preferir password suelta (se codifica bien si tiene ; ? % etc.)
  const password = env.SUPABASE_DB_PASSWORD;
  if (password) {
    return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${host}:5432/postgres`;
  }

  const direct = env.DIRECT_URL;
  if (direct && !direct.includes('[YOUR-PASSWORD]')) return direct;

  const pooled = env.DATABASE_URL;
  if (pooled && !pooled.includes('[YOUR-PASSWORD]')) {
    return pooled.replace('?pgbouncer=true', '').replace(':6543/', ':5432/');
  }

  return null;
}

async function runSqlFile(client, filePath, label) {
  const sql = readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  console.log(`→ ${label}…`);
  await client.query(sql);
  console.log(`  ✓ ${label}`);
}

function runNodeScript(name) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [pathResolve(root, 'scripts', name)], {
      cwd: root,
      stdio: 'inherit',
      shell: false,
    });
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${name} exit ${code}`))));
  });
}

async function main() {
  const env = {
    ...loadEnvLocal(),
    ...(process.env.DIRECT_URL && { DIRECT_URL: process.env.DIRECT_URL }),
    ...(process.env.DATABASE_URL && { DATABASE_URL: process.env.DATABASE_URL }),
    ...(process.env.SUPABASE_DB_PASSWORD && {
      SUPABASE_DB_PASSWORD: process.env.SUPABASE_DB_PASSWORD,
    }),
  };
  const databaseUrl = buildDatabaseUrl(env);

  if (!databaseUrl) {
    console.error(`
Falta conexión a Postgres. Añade en .env.local UNA de estas opciones:

  DIRECT_URL=postgresql://postgres.bsjvhewjhefntiasuxcx:TU_PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres

  — o —

  SUPABASE_DB_PASSWORD=tu_contraseña_de_base_de_datos

(Reemplaza [YOUR-PASSWORD] por la Database password del dashboard — no es la anon key)
`);
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  console.log('CanalPay — aplicando migraciones Fase 1\n');

  try {
    await client.connect();
    console.log('✓ Conectado a Postgres\n');

    await runSqlFile(
      client,
      pathResolve(root, 'supabase/apply-fase-1.sql'),
      'Schema + RLS + grants (apply-fase-1.sql)'
    );

    await client.end();

    console.log('\n→ Creando usuarios Auth…');
    await runNodeScript('phase1-create-users.mjs');

    const client2 = new Client({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    });
    await client2.connect();
    await runSqlFile(
      client2,
      pathResolve(root, 'supabase/migrations/20260522000003_seed_demo.sql'),
      'Seed demo'
    );
    await client2.end();

    console.log('\n→ Verificando…');
    await runNodeScript('phase1-verify.mjs');
  } catch (err) {
    console.error('\n✗ Error:', err.message);
    if (err.message?.includes('password authentication')) {
      console.error('  Revisa DATABASE_URL o SUPABASE_DB_PASSWORD en .env.local');
    }
    process.exit(1);
  }
}

main();
