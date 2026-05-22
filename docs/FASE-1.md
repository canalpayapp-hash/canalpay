# Fase 1 — Supabase (base de datos)

**Objetivo:** tablas, RLS, funciones públicas de pago simulado, datos demo y usuarios Auth.

**No incluye:** `npm install`, Next.js, Expo ni Git (eso es Fase 2+).

---

## Checklist

- [ ] **1.1** Ejecutar SQL de schema + RLS + grants en Supabase
- [ ] **1.2** Crear 3 usuarios en Authentication
- [ ] **1.3** Ejecutar SQL de seed demo
- [ ] **1.4** Verificar con script `phase1:verify`

---

## 1.1 Ejecutar migraciones SQL

### Opción A — Automático (recomendado)

1. En [Database settings](https://supabase.com/dashboard/project/bsjvhewjhefntiasuxcx/settings/database), copia la **Connection string (URI)** o la **Database password**.
2. Añade en `.env.local` (no se sube a Git):

```env
DATABASE_URL=postgresql://postgres.bsjvhewjhefntiasuxcx:TU_PASSWORD@....pooler.supabase.com:6543/postgres
```

(o solo `SUPABASE_DB_PASSWORD=...` si la región es `us-east-1`).

3. Ejecuta:

```powershell
npm install
npm run phase1:apply
```

Eso aplica SQL, crea usuarios Auth y corre el seed.

### Opción B — Manual en SQL Editor

1. Abre [SQL Editor](https://supabase.com/dashboard/project/bsjvhewjhefntiasuxcx/sql/new).
2. Ejecuta `supabase/apply-fase-1.sql`, luego usuarios + `20260522000003_seed_demo.sql`.

### Qué queda creado

- Tablas: `merchants`, `branches`, `profiles`, `customers`, `orders`, `payments`, `reconciliation_matches`, `cash_closures`
- RLS por `merchant_id` y rol
- RPC `get_order_for_payment` (página pública, sin login)
- RPC `simulate_order_payment` (simular pago)
- Función `generate_public_code()` → `CP-1005`, etc.

---

## 1.2 Usuarios demo (Auth)

### Opción A — Dar permiso al agente / script (recomendado)

1. Supabase → [Settings → API](https://supabase.com/dashboard/project/bsjvhewjhefntiasuxcx/settings/api)
2. Copia **`service_role`** (secret, no la `anon`).
3. Pégala **solo** en `.env.local` (nunca en Git ni en el chat si puedes evitarlo):

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

4. Ejecuta (o pide al agente que ejecute):

```powershell
npm run phase1:users
node scripts/phase1-rerun-seed.mjs
npm run phase1:verify
```

Con la service role el script usa `auth.admin.createUser` (sin límite 429 del signup público).

### Opción B — Manual en dashboard

En [Authentication → Users](https://supabase.com/dashboard/project/bsjvhewjhefntiasuxcx/auth/users), crea **3 usuarios** con email/contraseña:

| Email | Rol (se asigna en seed) |
|-------|-------------------------|
| `admin@dulcecaracas.com` | merchant_admin |
| `vendedor@dulcecaracas.com` | seller |
| `cajero@dulcecaracas.com` | cashier |

- Desactiva **Confirm email** en Auth settings si quieres entrar sin confirmar (recomendado para demo).
- Contraseña: la que acordamos para el entorno demo (no la subas al repo).

**Opción automática** (desde la raíz del repo, con `.env.local` configurado):

```powershell
cd c:\Empresa\CanalPay
node scripts/phase1-create-users.mjs
```

---

## 1.3 Seed demo

Con los 3 usuarios ya creados, ejecuta en SQL Editor:

`supabase/migrations/20260522000003_seed_demo.sql`

Crea:

- Comercio **Dulce Caracas**, sucursal **Chacao**
- Perfiles vinculados a los emails demo
- Clientes y órdenes **CP-1001** … **CP-1004**

---

## 1.4 Verificar

Copia `.env.example` → `.env.local` y completa URL + anon key.

```powershell
node scripts/phase1-verify.mjs
```

Debe mostrar: comercio OK, perfiles OK, órdenes demo OK, RPC público OK.

Prueba manual en SQL Editor:

```sql
select public.get_order_for_payment('CP-1002');
```

---

## Probar pago simulado (sin app aún)

En SQL Editor:

```sql
select public.simulate_order_payment('CP-1002', 'succeeded', 'mock');
select payment_status from public.orders where public_code = 'CP-1002';
-- Debe ser: paid
```

---

## Cuando termines

Escribe **siguiente** para pasar a **Fase 2** (monorepo, `npm install`, variables de entorno, arrancar web).

---

## Seguridad

- La **anon key** puede ir en el frontend; la **service_role** nunca en apps ni en Git.
- Si compartiste contraseñas en chat, cámbialas en producción.
