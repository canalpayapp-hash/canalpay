# Desplegar en Vercel (como Legalo)

Legalo despliega solo la carpeta `admin/`. CanalPay igual, con una línea extra para instalar `shared/`.

## Configuración en Vercel (proyecto **canalpay**)

| Campo | Valor |
|-------|--------|
| **Root Directory** | `admin` |
| **Framework** | Next.js (auto) |
| **Install Command** | *(vacío — usa `admin/vercel.json`)* |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |

El archivo `admin/vercel.json` solo añade:

```json
{ "installCommand": "cd ../shared && npm install && npm install" }
```

## Variables de entorno

En Vercel → Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` → `https://canalpay-canal-pay.vercel.app` (o tu dominio)
- `SUPABASE_SERVICE_ROLE_KEY` (recomendada para invitar usuarios)

## Comprobar build local

```powershell
npm run build:admin
```

## Deploy con CLI

```powershell
cd admin
npx vercel deploy --prod
```

Conecta el repo en GitHub y cada push despliega solo `admin/` si Root Directory = `admin`.

## Móvil

Tras el deploy, en `mobile/.env`:

```
EXPO_PUBLIC_APP_URL=https://tu-dominio.vercel.app
```
