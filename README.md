# CanalPay MVP

Pagos para canales rápidos (WhatsApp, Instagram, delivery, tienda).

## Estructura

```
apps/web      → Panel admin + link público /pagar/:code (Next.js)
apps/mobile   → App vendedor (Expo / React Native)
packages/shared → Tipos, tema, PaymentProvider mock
supabase/migrations → Base de datos PostgreSQL
```

## Requisitos

- Node.js 20+
- Cuenta [Supabase](https://supabase.com)
- Fase 1 completada (`docs/FASE-1.md`)

## Inicio rápido

```powershell
cd c:\Empresa\CanalPay
npm install
npm run phase1:verify   # Supabase listo
npm run phase2:setup    # .env → web y móvil
npm run web             # http://localhost:3000
npm run mobile          # Expo Go
npm run phase2:verify
```

Expo: cuenta [canalpay / canalpay-app](https://expo.dev/accounts/canalpay/projects/canalpay-app) — ver [docs/EXPO.md](docs/EXPO.md) para vincular (`expo login` + `eas init`).

Login demo: `admin@dulcecaracas.com` (tras seed Fase 1). Móvil: `vendedor@dulcecaracas.com` + Expo Go.

## Documentación por fases

| Fase | Doc |
|------|-----|
| 1 | `docs/FASE-1.md` — Supabase |
| 2 | `docs/FASE-2.md` — Instalación y arranque |

## Repo

https://github.com/canalpayapp-hash/canalpay
