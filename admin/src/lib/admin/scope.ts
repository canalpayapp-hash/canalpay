import type { SessionContext } from '@/lib/auth/session';

export type AdminScope = {
  isSuperAdmin: boolean;
  merchantId: string | null;
  role: string;
  userId: string;
};

export function getAdminScope(session: SessionContext): AdminScope {
  return {
    isSuperAdmin: session.profile?.role === 'super_admin',
    merchantId: session.profile?.merchant_id ?? null,
    role: session.profile?.role ?? '',
    userId: session.user.id,
  };
}

/** Filtro Supabase: null = sin filtro (super admin ve todo) */
export function merchantFilter(scope: AdminScope): { merchant_id?: string } {
  if (scope.isSuperAdmin) return {};
  if (scope.merchantId) return { merchant_id: scope.merchantId };
  return { merchant_id: '00000000-0000-0000-0000-000000000000' };
}
