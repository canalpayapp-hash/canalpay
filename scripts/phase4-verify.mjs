/**
 * Fase 4 — UI móvil vendedor (design system + tabs + pantallas).
 */
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const required = [
  'shared/src/theme.ts',
  'shared/src/orders.ts',
  'mobile/app/(tabs)/_layout.tsx',
  'mobile/app/(tabs)/index.tsx',
  'mobile/app/(tabs)/ordenes.tsx',
  'mobile/app/(tabs)/pagos.tsx',
  'mobile/app/(tabs)/perfil.tsx',
  'mobile/app/login.tsx',
  'mobile/app/crear-cobro.tsx',
  'mobile/app/orden-creada.tsx',
  'mobile/app/orden/[id].tsx',
  'mobile/components/OrderCard.tsx',
  'mobile/lib/orders.ts',
];

const removed = ['mobile/app/home.tsx', 'mobile/app/ordenes.tsx'];

console.log('CanalPay — Fase 4: verificación\n');

let ok = true;
for (const f of required) {
  const p = resolve(root, f);
  if (existsSync(p)) console.log(`✓ ${f}`);
  else {
    console.log(`✗ ${f}`);
    ok = false;
  }
}

for (const f of removed) {
  if (!existsSync(resolve(root, f))) console.log(`✓ eliminado ${f}`);
  else {
    console.log(`✗ aún existe ${f} (migrar a tabs)`);
    ok = false;
  }
}

if (ok) {
  console.log('\n✅ Fase 4 implementada.');
  console.log('   Prueba: npm run mobile → login vendedor → tabs Home/Órdenes/Pagos/Perfil');
  console.log('   Crear cobro → orden creada → WhatsApp / detalle');
} else process.exit(1);
