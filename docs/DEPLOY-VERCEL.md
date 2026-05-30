# Desplegar en Vercel (proyecto **canalpay**)

La app Next.js está en **`admin/`**.

## Si el build pasa pero la URL da **500**

Suele pasar cuando el **Output Directory** apunta a `.next` en la raíz (copia rota). Debe ser **`admin/.next`** o Root Directory = **`admin`**.

---

## Opción recomendada: Root Directory = `admin`

**Settings → General**

| Campo | Valor |
|--------|--------|
| **Root Directory** | `admin` |
| **Include files outside Root Directory** | **On** |
| **Build / Install / Output** | Override **OFF** (usa `admin/vercel.json`) |
| **Output Directory** | `.next` (default) |

---

## Opción B: Root Directory = `.` (raíz del repo)

Usa `vercel.json` en la raíz (ya incluido):

| Campo | Valor |
|--------|--------|
| **Install** | `npm run bootstrap:admin` |
| **Build** | `cd admin && npm run build` |
| **Output Directory** | **`admin/.next`** |

❌ No uses `apps/web/.next` ni `.next` solo en la raíz.

---

## Variables de entorno (obligatorias)

Sin estas, login y middleware fallan:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` → `https://canalpay.vercel.app`
- `SUPABASE_SERVICE_ROLE_KEY` (admin usuarios)

---

## Deploy

```powershell
git push origin main
```

Solo proyecto **canalpay** (borra el proyecto **web** si existe).
