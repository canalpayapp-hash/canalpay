# Git — GitHub canalpay

Repositorio: https://github.com/canalpayapp-hash/canalpay

---

## Estado

| Paso | Estado |
|------|--------|
| Commit local (`main`) | ✅ `5cfeeca` |
| Push a GitHub | ✅ Rama `main` en [canalpayapp-hash/canalpay](https://github.com/canalpayapp-hash/canalpay) |

Sesión: **`canalpayapp-hash`** (`gh auth status`). Si `git push` falla con `legaloapp-dot`, ejecuta:

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" auth setup-git
```

---

## Iniciar sesión desde la terminal (GitHub CLI)

Instalado: `gh` (GitHub CLI).

### Opción A — Código en el navegador (interactivo)

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" auth login --hostname github.com --git-protocol https --scopes repo
```

1. Copia el código que muestra (ej. `XXXX-XXXX`)
2. Abre https://github.com/login/device
3. Inicia sesión con la cuenta que **puede escribir** en `canalpayapp-hash/canalpay`
4. Pega el código y autoriza

Luego:

```powershell
cd c:\Empresa\CanalPay
git push -u origin main
```

### Opción B — Token en `.env.local` (sin navegador en Cursor)

1. Crea un PAT en https://github.com/settings/tokens (scope **repo**)
2. En `.env.local`: `GITHUB_TOKEN=ghp_...`
3. Ejecuta:

```powershell
npm run github:auth
git push -u origin main
```

### B) Personal Access Token (HTTPS)

1. GitHub → Settings → Developer settings → [Personal access tokens](https://github.com/settings/tokens)
2. Token con scope `repo` (cuenta con acceso al org `canalpayapp-hash`)
3. Push:

```powershell
git push -u origin main
# Usuario: canalpayapp-hash (o tu user con acceso)
# Contraseña: el token (no tu password de GitHub)
```

### C) Dar acceso a `legaloapp-dot`

En el repo → **Settings → Collaborators** → invitar `legaloapp-dot` con rol **Write**, luego:

```powershell
git push -u origin main
```

---

## Mantenerse sincronizado (día a día)

```powershell
cd c:\Empresa\CanalPay
git pull origin main          # antes de trabajar
# ... cambios ...
git add .
git commit -m "descripción"
git push origin main
```

**No subir nunca:** `.env.local`, `apps/web/.env.local`, `apps/mobile/.env` (ya están en `.gitignore`).

**Cada máquina nueva:**

```powershell
git clone https://github.com/canalpayapp-hash/canalpay.git
cd canalpay
copy .env.example .env.local
# completar claves Supabase, EXPO_TOKEN, etc.
npm install
npm run phase2:setup
```

---

## Secretos fuera de Git

| Archivo local | Contenido |
|---------------|-----------|
| `.env.local` | Supabase, Expo, DB password |
| `apps/web/.env.local` | URL + anon key web |
| `apps/mobile/.env` | URL + anon key móvil |

Comparte secretos por canal seguro (1Password, etc.), no por GitHub.
