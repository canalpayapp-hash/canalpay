# Guía de build y deploy (Vercel)

Esta guía evita los errores que tuvimos con `web`, `apps/web`, workspaces y builds rotos.

---

## 1. Estructura del repo (memorízala)

```
CanalPay/
├── admin/      ← Next.js (panel + /pagar/:code)   ← ESTO se despliega
├── mobile/     ← Expo (NO va a Vercel)
├── shared/     ← Código compartido (admin lo necesita)
├── supabase/
├── vercel.json ← Config si Root Directory = raíz del repo
└── package.json
```

| Nombre viejo (NO usar) | Nombre actual |
|------------------------|---------------|
| `apps/web/` | **`admin/`** |
| `web/` como carpeta del panel | **`admin/`** |
| `@canalpay/web` | **`@canalpay/admin`** |
| npm workspaces | **No existen** — cada carpeta instala sola |
| Proyecto Vercel **web** | Solo proyecto **`canalpay`** |

---

## 2. Reglas de oro

1. **Un solo proyecto en Vercel:** `canalpay`. Borra o ignora el proyecto **web** (fue un error al hacer `vercel deploy` dentro de `admin/`).
2. **Nunca despliegues con** `cd admin && vercel deploy` — crea o enlaza el proyecto equivocado.
3. **Deploy por Git:** `git push origin main` (con repo conectado a **canalpay**).
4. **En Vercel no instales `mobile/`** — choca React 19.1 (Expo) con 19.2 (admin).
5. **No copies `.next` a la raíz** — provoca **500 Internal Server Error**.
6. **Output Directory:** `admin/.next` o `.next` solo si Root Directory = `admin`.

---

## 3. Build en local (antes de subir)

Siempre comprueba en tu PC antes de confiar en Vercel:

```powershell
cd c:\Empresa\CanalPay

# Instalar solo lo necesario para el panel (sin mobile)
npm run bootstrap:admin

# Build de producción
npm run build:admin
```

**Debe terminar sin errores** y listar rutas como `/`, `/login`, `/admin`, `/pagar/[code]`.

### Desarrollo local

```powershell
npm run bootstrap          # Todo: shared + admin + mobile
npm run phase2:setup       # Copia .env.local → admin y mobile
npm run admin              # http://localhost:3000
npm run mobile             # Expo Go
```

---

## 4. Configuración en Vercel (proyecto **canalpay**)

Entra a [vercel.com](https://vercel.com) → **canalpay** → **Settings**.

### Opción A — Recomendada (como Legalo)

| Campo | Valor |
|--------|--------|
| **Root Directory** | `admin` |
| **Include files outside Root Directory** | **On** |
| **Framework** | Next.js |
| **Build / Install / Output** | Override **OFF** (usa `admin/vercel.json`) |

`admin/vercel.json` instala `shared` y construye Next:

- Install: `cd ../shared && npm install && npm install --include=dev`
- Build: `npm run build`
- Output: `.next` (automático)

### Opción B — Raíz del repo

| Campo | Valor |
|--------|--------|
| **Root Directory** | `.` (vacío / raíz) |
| **Install Command** | Override **OFF** o `npm run bootstrap:admin` |
| **Build Command** | Override **OFF** o `cd admin && npm run build` |
| **Output Directory** | Override **OFF** o **`admin/.next`** |

El repo incluye `vercel.json` en la raíz con estos valores.

### ❌ Valores que NO deben aparecer

| Incorrecto | Por qué falla |
|------------|----------------|
| `apps/web/.next` | Carpeta antigua del monorepo |
| `npm run build --workspace=@canalpay/web` | Workspaces eliminados |
| `npm run bootstrap` (con mobile) | Conflicto React en install |
| `framework: null` + copiar `.next` | Build OK pero **404/500** en la URL |
| Output `.next` en raíz sin app en raíz | **500** en producción |
| Proyecto Vercel **web** | Deploy duplicado y confuso |

---

## 5. Variables de entorno (Vercel → Settings → Environment Variables)

Copia desde tu `.env.local` local. **Production** y **Preview**:

| Variable | Obligatoria | Uso |
|----------|-------------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | Cliente Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí | Cliente Supabase |
| `NEXT_PUBLIC_APP_URL` | Sí | `https://canalpay.vercel.app` (o tu dominio) |
| `SUPABASE_SERVICE_ROLE_KEY` | Recomendada | Invitar usuarios en `/admin/usuarios` |

**No subas** a Vercel: passwords de demo, tokens Expo, `VERCEL_TOKEN` en el repo.

### Supabase (después del primer deploy)

Authentication → URL Configuration:

- **Site URL:** `https://canalpay.vercel.app`
- **Redirect URLs:** `https://canalpay.vercel.app/**`

### App móvil (links de pago en WhatsApp)

En `mobile/.env`:

```
EXPO_PUBLIC_APP_URL=https://canalpay.vercel.app
```

Los cobros **nuevos** usarán `/pagar/CP-xxxx` en producción. Los viejos guardados con `localhost` hay que recrearlos.

---

## 6. Flujo de deploy (el correcto)

```
1. Cambios en código
2. npm run build:admin     ← comprobar local
3. git add / commit / push origin main
4. Vercel despliega solo (Git conectado a canalpay)
5. Probar https://canalpay.vercel.app
```

```powershell
git add .
git commit -m "feat: descripción del cambio"
git push origin main
```

En Vercel → **Deployments** → el último debe quedar **Ready**.

### Deploy manual con CLI (opcional)

Solo desde la **raíz** del repo, con `.vercel` enlazado a **canalpay**:

```powershell
cd c:\Empresa\CanalPay
npx vercel deploy --prod
```

**No** ejecutes `vercel deploy` dentro de `admin/`.

---

## 7. Errores frecuentes y solución

| Síntoma | Causa | Solución |
|---------|--------|----------|
| `build --workspace=@canalpay/web` | Dashboard con config vieja | Quitar override; usar `vercel.json` del repo |
| `apps/web/.next was not found` | Output Directory viejo | Poner **`admin/.next`** o Root = `admin` |
| ERESOLVE react 19.1 vs 19.2 | Install incluye **mobile** | Usar **`bootstrap:admin`**, no `bootstrap` |
| `Cannot find module 'typescript'` | `npm install` en producción sin devDeps | No reinstalar en build; `--include=dev` en admin |
| Build OK, **404** | `.next` publicado como estáticos | Quitar `framework: null`; deploy Next normal |
| Build OK, **500** | `.next` copiado a raíz | Build en `admin/`; output **`admin/.next`** |
| Proyecto **web** en Vercel | CLI desde `admin/` | Borrar proyecto web; solo **canalpay** |
| Agente Cursor corta comandos | Timeout / chat | `git push` tú en terminal; esta guía |

---

## 8. Checklist antes de cada deploy importante

- [ ] `npm run build:admin` pasa en local
- [ ] Proyecto Vercel = **canalpay** (no web)
- [ ] Root Directory = **`admin`** o output = **`admin/.next`**
- [ ] No hay referencias a `apps/web` en Settings
- [ ] Variables `NEXT_PUBLIC_*` configuradas
- [ ] `git push origin main` hecho
- [ ] Deployment **Ready** en Vercel
- [ ] Home, `/login` y `/pagar/CP-xxxx` abren en producción
- [ ] `EXPO_PUBLIC_APP_URL` actualizado en mobile si cambió el dominio

---

## 9. Scripts útiles (referencia)

| Comando | Qué hace |
|---------|----------|
| `npm run bootstrap` | Instala raíz + shared + admin + **mobile** |
| `npm run bootstrap:admin` | Instala raíz + shared + **admin** (Vercel) |
| `npm run build:admin` | Build producción Next.js |
| `npm run admin` | Dev server localhost:3000 |
| `npm run phase2:setup` | Sincroniza `.env.local` → admin y mobile |

---

## 10. Resumen en una frase

**Despliega solo `admin/` (con `shared/`), en el proyecto Vercel `canalpay`, sin workspaces, sin carpeta `web`, sin instalar mobile en el build, y con output en `admin/.next` o Root Directory = `admin`.**
