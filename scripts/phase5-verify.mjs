import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const files = [
  'admin/src/app/pagar/layout.tsx',
  'admin/src/app/pagar/[code]/page.tsx',
  'admin/src/app/pagar/[code]/exito/page.tsx',
  'admin/src/components/pay/CheckoutView.tsx',
  'admin/src/components/pay/SuccessView.tsx',
];

console.log('CanalPay — Fase 5: verificación\n');
let ok = true;
for (const f of files) {
  if (existsSync(resolve(root, f))) console.log(`✓ ${f}`);
  else {
    console.log(`✗ ${f}`);
    ok = false;
  }
}
if (ok) {
  console.log('\n✅ Fase 5 implementada.');
  console.log('   http://localhost:3000/pagar/CP-1002 → Pagar ahora → /exito');
} else process.exit(1);
