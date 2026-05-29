# Fase 3 — Auth y roles

**Objetivo:** cada usuario entra solo donde corresponde (web admin vs app móvil).

---

## Matriz de acceso

| Rol | Panel web `/admin` | App móvil |
|-----|-------------------|-----------|
| `merchant_admin` | ✅ | ❌ → sin-acceso |
| `supervisor` | ✅ (sin menú Clientes) | ❌ |
| `seller` | ❌ → sin-acceso | ✅ |
| `cashier` | ❌ | ✅ |
| `super_admin` | ✅ | ✅ |

---

## Estados de cuenta

| Estado | Pantalla web | Pantalla móvil |
|--------|--------------|----------------|
| Sin perfil / sin comercio | `/perfil-incompleto` | `/perfil-incompleto` |
| `inactive` | `/cuenta-inactiva` | `/cuenta-inactiva` |
| Rol incorrecto | `/sin-acceso` | `/sin-acceso` |

---

## Probar manualmente

```powershell
npm run admin
npm run mobile
```

| Usuario | Esperado |
|---------|----------|
| `admin@dulcecaracas.com` | Entra a `/admin`, ve comercio Dulce Caracas |
| `vendedor@dulcecaracas.com` | No entra a `/admin`; en móvil ve home + crear cobro |
| `cajero@dulcecaracas.com` | Igual que vendedor en móvil |

Contraseña: `DEMO_USER_PASSWORD` en `.env.local`.

---

## Código clave

- `shared/src/auth.ts` — reglas de rol
- `admin/src/middleware.ts` — guard web
- `admin/src/lib/auth/session.ts` — sesión servidor
- `mobile/context/AuthContext.tsx` — guard móvil

---

## Siguiente

**Fase 4** — Flujo vendedor (crear cobro completo, mockups si los tienes).
