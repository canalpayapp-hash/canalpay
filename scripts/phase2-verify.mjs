/**
 * Fase 2 — Verifica instalación local (sin abrir navegador).
 */
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function check(cond, ok, fail) {
  if (cond) console.log(`✓ ${ok}`);
  else {
    console.log(`✗ ${fail}`);
    failed++;
  }
}

console.log('CanalPay — Fase 2: verificación\n');

check(existsSync(resolve(root, 'node_modules')), 'node_modules (raíz)', 'Ejecuta npm install');
check(
  existsSync(resolve(root, 'apps/web/node_modules')),
  'apps/web dependencias',
  'npm install en raíz'
);
check(
  existsSync(resolve(root, 'apps/mobile/node_modules')),
  'apps/mobile dependencias (Expo/RN)',
  'npm install en raíz'
);
check(existsSync(resolve(root, 'apps/web/.env.local')), 'apps/web/.env.local', 'npm run phase2:setup');
check(existsSync(resolve(root, 'apps/mobile/.env')), 'apps/mobile/.env', 'npm run phase2:setup');

const ports = [3000, 3001];
let webPort = null;
for (const port of ports) {
  try {
    const res = await fetch(`http://localhost:${port}/login`, {
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      webPort = port;
      console.log(`✓ Web responde en :${port}/login`);
      break;
    }
  } catch {
    /* try next port */
  }
}
if (!webPort) {
  console.log('✗ Web no responde en :3000 ni :3001 — ejecuta npm run web');
  failed++;
}

if (webPort) {
  try {
    const res = await fetch(`http://localhost:${webPort}/pagar/CP-1002`, {
      signal: AbortSignal.timeout(10000),
    });
    check(res.ok, 'Página /pagar/CP-1002', 'Revisa Supabase Fase 1');
  } catch {
    console.log('⚠ No se pudo probar /pagar');
  }
}

if (failed === 0) {
  console.log('\n✅ Fase 2 lista.');
  console.log('  npm run web     → panel + pagos');
  console.log('  npm run mobile  → app vendedor (Expo Go)');
} else {
  console.log(`\n⚠ ${failed} chequeo(s) fallaron.`);
  process.exit(1);
}
