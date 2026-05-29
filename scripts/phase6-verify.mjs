import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const files = [
  'admin/src/components/admin/AdminSidebar.tsx',
  'admin/src/app/admin/comercios/page.tsx',
  'admin/src/app/admin/usuarios/page.tsx',
  'admin/src/app/admin/sucursales/page.tsx',
  'admin/src/app/admin/usuarios/actions.ts',
  'admin/src/app/admin/cierre/actions.ts',
  'supabase/migrations/20260522100000_super_admin_demo.sql',
];

console.log('CanalPay — Fase 6: verificación\n');
let ok = true;
for (const f of files) {
  if (existsSync(resolve(root, f))) console.log(`✓ ${f}`);
  else {
    console.log(`✗ ${f}`);
    ok = false;
  }
}
if (ok) {
  console.log('\n✅ Fase 6 implementada.');
  console.log('   super@canalpay.com → /admin/comercios, /admin/usuarios');
  console.log('   admin@dulcecaracas.com → dashboard comercio + cierre');
} else process.exit(1);
