import type { Profile, UserRole } from './types';

/** Roles con acceso al panel web administrador */
export const WEB_ADMIN_ROLES: UserRole[] = ['super_admin', 'merchant_admin', 'supervisor'];

/** Roles con acceso a la app móvil operativa */
export const MOBILE_APP_ROLES: UserRole[] = ['super_admin', 'seller', 'cashier'];

export type ProfileGateStatus = 'ok' | 'no_profile' | 'inactive' | 'no_merchant';

export function canAccessWebAdmin(role: string | null | undefined): boolean {
  return !!role && WEB_ADMIN_ROLES.includes(role as UserRole);
}

export function canAccessMobileApp(role: string | null | undefined): boolean {
  return !!role && MOBILE_APP_ROLES.includes(role as UserRole);
}

export function getProfileGateStatus(
  profile: Pick<Profile, 'status' | 'merchant_id' | 'role'> | null
): ProfileGateStatus {
  if (!profile) return 'no_profile';
  if (profile.status === 'inactive') return 'inactive';
  if (!profile.merchant_id && profile.role !== 'super_admin') return 'no_merchant';
  return 'ok';
}

export function getRoleLabel(role: UserRole | string): string {
  const labels: Record<string, string> = {
    super_admin: 'Super Admin',
    merchant_admin: 'Administrador',
    supervisor: 'Supervisor',
    seller: 'Vendedor',
    cashier: 'Cajero',
  };
  return labels[role] ?? role;
}

export function translateAuthError(message: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': 'Email o contraseña incorrectos',
    'Email not confirmed': 'Confirma tu email antes de entrar',
    'User already registered': 'Este email ya está registrado',
    'email rate limit exceeded': 'Demasiados intentos. Espera un momento.',
    'Token has expired or is invalid': 'Código incorrecto o vencido. Solicita uno nuevo.',
    'For security purposes, you can only request this after': 'Espera un momento antes de pedir otro código.',
    'Signups not allowed for otp': 'El registro por código no está habilitado en el servidor.',
  };
  const lower = message.toLowerCase();
  if (lower.includes('rate limit')) return 'Demasiados intentos. Espera un momento.';
  if (lower.includes('invalid') && lower.includes('otp')) return 'Código incorrecto o vencido.';
  return map[message] ?? message;
}
