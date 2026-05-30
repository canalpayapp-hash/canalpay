# Desplegar en Vercel (proyecto **canalpay**)

La app Next.js está en **`admin/`** (no `web/`, no `apps/web`).

## Settings obligatorios (proyecto **canalpay**)

**Settings → General → Build & Development Settings**

| Campo | Valor correcto | ❌ Quitar |
|--------|----------------|-----------|
| **Root Directory** | `.` (raíz) o `admin` | `apps/web`, `web` |
| **Build Command** | Override **OFF** o `npm run vercel-build` | `--workspace=@canalpay/web` |
| **Install Command** | Override **OFF** o `npm run bootstrap:admin` | `npm install` solo raíz |
| **Output Directory** | Override **OFF** o **`.next`** | **`apps/web/.next`** |

El repo incluye `vercel.json` en la raíz con estos valores.

### Si Root Directory = `admin`

- Install: `cd ../shared && npm install && npm install --include=dev`
- Build: `npm run build`
- Output: `.next`
- Activar **Include files outside Root Directory**

---

## Variables de entorno

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` → `https://canalpay.vercel.app`
- `SUPABASE_SERVICE_ROLE_KEY`

## Proyecto **web** en Vercel

Ese proyecto es un error antiguo. **Bórralo.** Usa solo **canalpay**.

## Deploy

```powershell
git push origin main
```
