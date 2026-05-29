# Fase 5 — Pago público (link de WhatsApp)

## Cómo se abre desde WhatsApp

WhatsApp **no permite** incrustar una app React Native como modal nativo. Lo que hace es abrir el **link en el navegador interno** (webview). Por eso implementamos:

- Ruta web: `/pagar/[code]` y `/pagar/[code]/exito`
- Layout **tipo hoja/modal**: fondo oscuro + tarjeta blanca (en desktop centrada; en móvil sube desde abajo como sheet)
- Sin menú admin ni login

Flujo: vendedor comparte link → cliente toca en WhatsApp → checkout → éxito → puede cerrar la ventana.

## Pantallas

| Ruta | Mockup |
|------|--------|
| `/pagar/CP-xxxx` | `pago_de_orden_canalpay` |
| `/pagar/CP-xxxx/exito` | `pago_exitoso_canalpay` |

## Pago sin banco (MVP)

Botón **Pagar ahora** llama `simulate_order_payment` (mock). No hay cargo real.

## Probar

```powershell
npm run admin
# Abrir http://localhost:3000/pagar/CP-1002
```

Desde móvil: `EXPO_PUBLIC_APP_URL` debe ser la URL que el teléfono alcanza (IP LAN o túnel), no solo `localhost` del PC.

## Siguiente

Fase 6 — panel admin + cierre de caja.
