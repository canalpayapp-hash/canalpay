/** Tokens Material 3 — mockups CanalPay (púrpura) */
export const colors = {
  primary: '#4f378a',
  primaryContainer: '#6750a4',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#e0d2ff',
  background: '#fdf7ff',
  surface: '#fdf7ff',
  surfaceContainerLow: '#f8f2fa',
  surfaceContainerLowest: '#ffffff',
  surfaceContainer: '#f2ecf4',
  surfaceContainerHigh: '#ece6ee',
  surfaceContainerHighest: '#e6e0e9',
  onSurface: '#1d1b20',
  onSurfaceVariant: '#494551',
  onBackground: '#1d1b20',
  outline: '#7a7582',
  outlineVariant: '#cbc4d2',
  secondary: '#63597c',
  secondaryContainer: '#e1d4fd',
  onSecondaryContainer: '#645a7d',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  tertiary: '#765b00',
  tertiaryContainer: '#c9a74d',
  tertiaryFixed: '#ffdf93',
  whatsapp: '#25D366',
  paidBg: '#E8F5E9',
  paidText: '#2E7D32',
  paidBgAlt: '#C6F6D5',
  paidTextAlt: '#22543D',
  pendingBg: '#e1d4fd',
  pendingText: '#4f378a',
  failedBg: '#ffdad6',
  failedText: '#93000a',
  /** Alias legacy (web PRD) — apuntan al design system móvil */
  navy: '#4f378a',
  teal: '#6750a4',
  blue: '#6750a4',
  text: '#1d1b20',
  gray: '#494551',
  white: '#ffffff',
  success: '#2E7D32',
  warning: '#765b00',
  danger: '#ba1a1a',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export const copy = {
  homeTagline: 'Crea cobros en segundos desde cualquier canal de venta.',
  createChargeTagline: 'Convierte esta venta en un pago trazable.',
  publicPayTagline: 'Completa tu pago para confirmar el pedido.',
  dashboardTagline: 'Ventas, pagos y conciliación en un solo lugar.',
} as const;
