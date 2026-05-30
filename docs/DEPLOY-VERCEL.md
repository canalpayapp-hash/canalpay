# Desplegar en Vercel (proyecto **canalpay**)

## Error: `npm run build --workspace=@canalpay/web`

El dashboard tiene **configuración vieja** (`apps/web`, workspaces). Corrígelo en:

**Settings → General → Build & Development Settings**

| Campo | Valor |
|--------|--------|
| **Build Command** | Override **OFF** (usa `vercel.json`) **o** `npm run vercel-build` |
| **Install Command** | Override **OFF** **o** `npm run bootstrap` |
| **Output Directory** | Override **OFF** |

Quita `@canalpay/web`, `apps/web` y `--workspace=`.

El repo incluye `vercel.json` en la raíz con los comandos correctos.

---

## Root Directory (elige una)

**A) Raíz `.`** — usa `vercel.json` + `npm run vercel-build` (ya configurado).

**B) `admin`** — Install: `cd ../shared && npm install && npm install`, Build: `npm run build`, activar **Include files outside Root Directory**.

---

## Variables de entorno

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` → `https://canalpay.vercel.app`
- `SUPABASE_SERVICE_ROLE_KEY`

## Solo proyecto **canalpay** (no **web**)

Cada `git push` a `main` despliega si Git está conectado.
