/**
 * Build para Vercel cuando Root Directory del dashboard sigue en la raíz del repo.
 * Construye admin/ y deja .next en la raíz para el runtime de Next.js.
 */
import { execSync } from 'child_process';
import { cpSync, existsSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd, cwd = root) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', shell: true });
}

run('npm install', resolve(root, 'shared'));
run('npm install', resolve(root, 'admin'));
run('npm run build', resolve(root, 'admin'));

const srcNext = resolve(root, 'admin', '.next');
const dstNext = resolve(root, '.next');
if (existsSync(dstNext)) rmSync(dstNext, { recursive: true, force: true });
cpSync(srcNext, dstNext, { recursive: true });

const srcPublic = resolve(root, 'admin', 'public');
const dstPublic = resolve(root, 'public');
if (existsSync(srcPublic)) {
  if (existsSync(dstPublic)) rmSync(dstPublic, { recursive: true, force: true });
  cpSync(srcPublic, dstPublic, { recursive: true });
}

console.log('✓ Build listo (.next en raíz para Vercel)');
