import { redirect } from 'next/navigation';
import { getRoleLabel } from '@canalpay/shared';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { getSessionContext } from '@/lib/auth/session';

const GATE_REDIRECT: Record<string, string> = {
  inactive: '/cuenta-inactiva',
  no_profile: '/perfil-incompleto',
  no_merchant: '/perfil-incompleto',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionContext();

  if (!session) redirect('/login');
  if (!session.canAdmin) redirect('/sin-acceso?motivo=mobile');
  if (session.gate !== 'ok') redirect(GATE_REDIRECT[session.gate]);

  const merchantLine =
    session.merchantName && session.branchName
      ? `${session.merchantName} · ${session.branchName}`
      : session.merchantName ?? (session.isSuperAdmin ? 'Todos los comercios' : null);

  return (
    <div className="flex min-h-screen bg-cp-background">
      <AdminSidebar
        role={session.profile!.role}
        fullName={session.profile?.full_name ?? session.user.email ?? 'Usuario'}
        roleLabel={getRoleLabel(session.profile!.role)}
        merchantLine={merchantLine}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-cp-outline-variant bg-cp-surface px-4 md:px-6">
          <span className="font-bold text-cp-primary md:hidden">CanalPay Admin</span>
          <span className="hidden text-sm font-semibold text-cp-on-surface-variant md:block">
            {session.isSuperAdmin ? 'Panel plataforma' : merchantLine}
          </span>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
