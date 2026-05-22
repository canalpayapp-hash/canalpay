/**
 * Comprueba sesión Expo usando EXPO_TOKEN en .env.local
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env.local');
if (!existsSync(envPath)) {
  console.error('Falta .env.local con EXPO_TOKEN');
  process.exit(1);
}
let token = '';
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  if (line.startsWith('EXPO_TOKEN=')) token = line.slice('EXPO_TOKEN='.length).trim();
}
if (!token) {
  console.error('EXPO_TOKEN no definido en .env.local');
  process.exit(1);
}

const child = spawn('npx', ['expo', 'whoami'], {
  cwd: resolve(root, 'apps/mobile'),
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, EXPO_TOKEN: token },
});
child.on('close', (code) => process.exit(code ?? 0));
