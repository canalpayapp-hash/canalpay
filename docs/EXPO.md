# Expo — cuenta CanalPay

Proyecto en Expo: [canalpay / canalpay-app](https://expo.dev/accounts/canalpay/projects/canalpay-app)

Config local en `mobile/app.json`:

- `owner`: `canalpay`
- `slug`: `canalpay-app`

---

## Estado actual (vinculado)

| Campo | Valor |
|-------|--------|
| Cuenta | `canalpay` |
| Proyecto | [canalpay-app](https://expo.dev/accounts/canalpay/projects/canalpay-app) |
| Project ID | `3eae55fc-e233-4d18-b34b-980f0d806c97` |
| Config | `mobile/app.json` → `owner`, `slug`, `extra.eas.projectId` |

Token en `.env.local` como `EXPO_TOKEN` (no commitear).

Comprobar sesión:

```powershell
npm run expo:whoami
```

---

## Vincular de nuevo (si cambias de máquina)

```powershell
# .env.local con EXPO_TOKEN de canalpay
cd mobile
npx eas init --non-interactive --force
```

## Registro con OTP (email)

1. En Supabase → **Authentication** → **Providers** → Email: activar **Email OTP** (o magic link con código).
2. En **Email Templates** → *Magic Link* o plantilla OTP, incluir el token de 6 dígitos: `{{ .Token }}` (ver [docs Supabase](https://supabase.com/docs/guides/auth/auth-email-passwordless)).
3. Aplicar migración `supabase/migrations/20260525120000_mobile_self_register.sql` (función `complete_mobile_registration`).
4. En la app: **Crear cuenta** → email → código → perfil vendedor (admin asigna comercio después).

---

## 3. Desarrollo local (Expo Go)

No requiere EAS para probar en el celular:

```powershell
cd c:\Empresa\CanalPay
npm run mobile
```

---

## Notas

- El `slug` anterior era `canalpay`; ahora es **`canalpay-app`** para coincidir con Expo.
- No subas tokens de Expo a Git; usa `EXPO_TOKEN` solo en CI si hace falta.
