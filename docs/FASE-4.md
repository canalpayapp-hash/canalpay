# Fase 4 — App móvil vendedor (UI mockups)

## Qué incluye

- **Design system** púrpura Material 3 en `shared/src/theme.ts`
- Helpers de órdenes: `formatCurrency`, badges de estado, canales en `shared/src/orders.ts`
- **Bottom tabs:** Home · Órdenes · Pagos · Perfil
- Pantallas rediseñadas: login, home, crear cobro, orden creada, lista órdenes (búsqueda + filtros), detalle orden
- Datos Supabase: métricas del día, órdenes del vendedor, sucursales al crear cobro

## Rutas móvil

| Ruta | Descripción |
|------|-------------|
| `/(tabs)` | Home |
| `/(tabs)/ordenes` | Lista con búsqueda y chips |
| `/(tabs)/pagos` | Órdenes pagadas |
| `/(tabs)/perfil` | Perfil y cerrar sesión |
| `/crear-cobro` | Formulario + canales + moneda |
| `/orden-creada` | QR, copiar link, WhatsApp |
| `/orden/[id]` | Detalle |

## Verificar

```powershell
cd c:\Empresa\CanalPay
npm run phase4:verify
npm run mobile
```

Login demo: `vendedor@dulcecaracas.com` + `DEMO_USER_PASSWORD` en `.env.local`.

## Siguiente fase

**Fase 5** — Link público de pago (`/pagar/:code` en web) según mockups `pago_de_orden` y `pago_exitoso`.
