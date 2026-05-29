# Fase 6 — Panel admin + Super Admin

## Roles

| Rol | Panel web | Alcance |
|-----|-----------|---------|
| `super_admin` | ✅ Plataforma | Todos los comercios, usuarios, órdenes |
| `merchant_admin` | ✅ Comercio | Su comercio + invitar equipo |
| `supervisor` | ✅ Comercio | Lectura operativa, cierre |

## Super Admin

Usuario demo: **`super@canalpay.com`** (misma contraseña `DEMO_USER_PASSWORD`).

1. Crear usuario: `npm run phase1:users`
2. Aplicar migraciones (incluye perfil super): `npm run phase1:apply`

### Rutas solo super admin

- `/admin/comercios` — alta / activar-desactivar comercios
- Dashboard plataforma — KPIs globales

### Rutas super + merchant admin

- `/admin/usuarios` — listar, editar rol/estado, **invitar** (requiere `SUPABASE_SERVICE_ROLE_KEY` en servidor web)

## Cierre de caja

- `/admin/cierre` — totales del día, desglose por vendedor
- **Guardar borrador** / **Marcar como revisado** → tabla `cash_closures`
- Super admin: elegir comercio desde lista (`?comercio=uuid`)

## Variables web (invitar usuarios)

En `admin/.env.local`:

```
SUPABASE_SERVICE_ROLE_KEY=...
```

## Verificar

```powershell
npm run phase6:verify
npm run admin
# Login super@canalpay.com → /admin/comercios
```
