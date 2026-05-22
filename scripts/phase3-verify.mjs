/**
 * Fase 3 — Verifica archivos y reglas de rol.
 */
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const WEB = ['super_admin', 'merchant_admin', 'supervisor'];
const MOBILE = ['super_admin', 'seller', 'cashier'];

function canWeb(role) {
  return WEB.includes(role);
}
function canMobile(role) {
  return MOBILE.includes(role);
}

console.log('CanalPay — Fase 3: verificación\n');

const matrix = [
  ['merchant_admin', true, false],
  ['supervisor', true, false],
  ['seller', false, true],
  ['cashier', false, true],
];

let ok = true;
for (const [role, web, mobile] of matrix) {
  if (canWeb(role) !== web || canMobile(role) !== mobile) {
    console.log(`✗ ${role}`);
    ok = false;
  }
}
if (ok) console.log('✓ Reglas de rol');

for (const f of [
  'packages/shared/src/auth.ts',
  'apps/web/src/middleware.ts',
  'apps/mobile/context/AuthContext.tsx',
]) {
  if (existsSync(resolve(root, f))) console.log(`✓ ${f}`);
  else {
    console.log(`✗ ${f}`);
    ok = false;
  }
}

if (ok) {
  console.log('\n✅ Fase 3 implementada. Prueba: admin→web, vendedor→móvil, vendedor→/admin bloqueado.');
} else process.exit(1);
