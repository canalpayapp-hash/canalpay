# Git — GitHub canalpay

Repositorio: https://github.com/canalpayapp-hash/canalpay

---

## Estado

| Paso | Estado |
|------|--------|
| Commit local (`main`) | ✅ `5cfeeca` |
| Push a GitHub | ⏳ Requiere credenciales de **canalpayapp-hash** |

El `git push` falló porque en esta PC Git está autenticado como **`legaloapp-dot`**, sin permiso de escritura en ese repo.

---

## Qué hacer para subir (elige una)

### A) Iniciar sesión con la cuenta correcta (recomendado)

```powershell
# GitHub CLI
gh auth login
gh auth status

cd c:\Empresa\CanalPay
git push -u origin main
```

Usa la cuenta que es **owner** o **colaborador** de `canalpayapp-hash/canalpay`.

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
