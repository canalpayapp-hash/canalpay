# CanalPay MVP

Pagos para canales rápidos (WhatsApp, Instagram, delivery, tienda).

## Estructura (estilo Legalo)

```
admin/        → Panel + link público /pagar/:code (Next.js)
mobile/       → App vendedor (Expo)
shared/       → Tipos y tema compartidos (única diferencia con Legalo)
supabase/     → Base de datos
```

Cada carpeta tiene su propio `package.json` y `node_modules` — sin npm workspaces.

## Requisitos

- Node.js 20+
- Cuenta [Supabase](https://supabase.com)

## Inicio rápido

```powershell
cd c:\Empresa\CanalPay
npm run bootstrap
npm run phase2:setup
npm run admin          # http://localhost:3000
npm run mobile         # Expo Go

# O directo:
cd mobile
npx expo start --clear
```

Deploy y build en producción: **[docs/DEPLOY-VERCEL.md](docs/DEPLOY-VERCEL.md)** (guía completa — evita errores con `web` / Vercel).

## Repo

https://github.com/canalpayapp-hash/canalpay
