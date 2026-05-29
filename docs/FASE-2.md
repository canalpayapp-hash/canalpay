# Fase 2 — Monorepo e instalación

**Objetivo:** proyecto instalado y arrancando en local (web + móvil).

**Requisito:** Fase 1 completa (`npm run phase1:verify` en verde).

---

## Checklist

- [x] `npm install` en la raíz
- [x] Variables en `admin/.env.local` y `mobile/.env`
- [x] `npm run admin` → http://localhost:3000
- [x] `npm run mobile` → Expo (Expo Go)
- [x] Metro configurado para monorepo
- [x] Scripts `phase2:setup` y `phase2:verify`
- [x] `npm run build:admin` — producción

---

## Comandos

```powershell
cd c:\Empresa\CanalPay
npm install
npm run phase2:setup    # sincroniza .env a admin y móvil
npm run admin           # terminal 1
npm run mobile          # terminal 2 — escanea QR con Expo Go
npm run phase2:verify   # comprobación rápida
npm run build:admin     # producción
```

---

## Login demo

| App | Email | Contraseña |
|-----|-------|------------|
| Web admin | `admin@dulcecaracas.com` | `DEMO_USER_PASSWORD` en `.env.local` |
| Móvil vendedor | `vendedor@dulcecaracas.com` | misma |

---

## URLs útiles

- Inicio: http://localhost:3000
- Admin: http://localhost:3000/admin
- Pago demo: http://localhost:3000/pagar/CP-1002

---

## Git (opcional)

```powershell
git init
git add .
git commit -m "CanalPay MVP: Fase 1 Supabase + Fase 2 monorepo"
git remote add origin https://github.com/canalpayapp-hash/canalpay.git
git branch -M main
git push -u origin main
```

No subas `.env.local`, `admin/.env.local`, `mobile/.env` ni `SUPABASE_SERVICE_ROLE_KEY`.

---

## Siguiente

Escribe **siguiente** para **Fase 3** (auth por roles, flujos vendedor/admin según PRD).
