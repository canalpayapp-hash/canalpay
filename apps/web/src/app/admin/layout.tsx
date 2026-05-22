import Link from 'next/link';
import { redirect } from 'next/navigation';
import { colors, getRoleLabel } from '@canalpay/shared';
import { AdminNav } from '@/components/AdminNav';
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

  return (
    <div className="min-h-screen flex">
      <aside
        className="w-56 shrink-0 p-4 text-white flex flex-col gap-2"
        style={{ backgroundColor: colors.navy }}
      >
        <Link href="/admin" className="text-xl font-bold mb-2">
          CanalPay
        </Link>
        <div className="text-xs opacity-80 mb-4 space-y-0.5">
          <p className="font-medium truncate">{session.profile?.full_name}</p>
          <p>{getRoleLabel(session.profile!.role)}</p>
          {session.merchantName && (
            <p className="truncate">
              {session.merchantName}
              {session.branchName ? ` · ${session.branchName}` : ''}
            </p>
          )}
        </div>
        <AdminNav role={session.profile!.role} />
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
