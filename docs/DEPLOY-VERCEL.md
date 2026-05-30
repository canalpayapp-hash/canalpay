# Desplegar en Vercel (proyecto **canalpay**)

## Si ves `404: NOT_FOUND`

Suele pasar si el deploy usó `framework: null` y publicó `.next` como archivos estáticos. Hay que redesplegar como **Next.js**.

### Opción A — Dashboard (recomendada)

Proyecto **canalpay** → **Settings** → **General**:

| Campo | Valor |
|--------|--------|
| **Root Directory** | `admin` |
| **Include files outside Root Directory** | **On** |
| **Build Command** | `npm run build` (por defecto) |
| **Install Command** | *(vacío; usa `admin/vercel.json`)* |

Quita overrides viejos (`apps/web`, workspaces).

Luego **Deployments** → último deploy → **Redeploy**.

### Opción B — Raíz del repo (sin cambiar dashboard)

El script `npm run vercel-build` en la raíz construye `admin/` y deja `.next` en la raíz. Vercel lo ejecuta si existe el script `vercel-build` en `package.json`.

---

## Variables de entorno (proyecto canalpay)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` → `https://canalpay.vercel.app`
- `SUPABASE_SERVICE_ROLE_KEY`

## No uses el proyecto **web**

Ese proyecto se creó por error al desplegar desde `admin/` con el CLI. Borra **web** en Vercel y usa solo **canalpay**.

## Deploy CLI (solo desde la raíz del repo)

```powershell
cd c:\Empresa\CanalPay
npx vercel deploy --prod
```

**No** ejecutes `vercel deploy` dentro de `admin/`.
