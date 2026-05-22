/**
 * Autentica GitHub CLI con GITHUB_TOKEN en .env.local
 * Uso: node scripts/github-auth.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env.local');

if (!existsSync(envPath)) {
  console.error('Crea .env.local con GITHUB_TOKEN=ghp_...');
  process.exit(1);
}

let token = '';
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  if (line.startsWith('GITHUB_TOKEN=')) token = line.slice('GITHUB_TOKEN='.length).trim();
}

if (!token) {
  console.error('Añade GITHUB_TOKEN= en .env.local (PAT con scope repo)');
  process.exit(1);
}

const gh = process.platform === 'win32'
  ? 'C:\\Program Files\\GitHub CLI\\gh.exe'
  : 'gh';

const r = spawnSync(gh, ['auth', 'login', '--with-token'], {
  input: token,
  encoding: 'utf8',
  stdio: ['pipe', 'inherit', 'inherit'],
});

if (r.status !== 0) process.exit(r.status ?? 1);

const who = spawnSync(gh, ['auth', 'status'], { encoding: 'utf8' });
console.log(who.stdout || who.stderr);
console.log('\n✓ GitHub CLI autenticado. Ejecuta: git push -u origin main');
