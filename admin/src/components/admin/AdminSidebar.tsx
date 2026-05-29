'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { UserRole } from '@canalpay/shared';
import { createClient } from '@/lib/supabase/client';

type NavItem = { href: string; label: string; icon: string; roles?: UserRole[] };

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: '◉' },
  { href: '/admin/comercios', label: 'Comercios', icon: '◎', roles: ['super_admin'] },
  { href: '/admin/usuarios', label: 'Usuarios', icon: '👤', roles: ['super_admin', 'merchant_admin'] },
  { href: '/admin/ordenes', label: 'Órdenes', icon: '☰' },
  { href: '/admin/pagos', label: 'Pagos', icon: '₿' },
  { href: '/admin/clientes', label: 'Clientes', icon: '♡', roles: ['merchant_admin', 'supervisor', 'super_admin'] },
  { href: '/admin/sucursales', label: 'Sucursales', icon: '⌂', roles: ['merchant_admin', 'super_admin'] },
  {
    href: '/admin/cierre',
    label: 'Cierre de caja',
    icon: '▣',
    roles: ['merchant_admin', 'supervisor', 'super_admin'],
  },
];

export function AdminSidebar({
  role,
  fullName,
  roleLabel,
  merchantLine,
}: {
  role: UserRole;
  fullName: string;
  roleLabel: string;
  merchantLine?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const links = NAV.filter((l) => !l.roles || l.roles.includes(role));

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-cp-outline-variant bg-cp-surface-container-low py-6">
      <div className="px-6 mb-8">
        <Link href="/admin" className="text-xl font-black text-cp-primary">
          CanalPay Admin
        </Link>
        {role === 'super_admin' && (
          <p className="mt-1 text-xs font-semibold text-cp-on-surface-variant">Plataforma</p>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {links.map((l) => {
          const active = pathname === l.href || (l.href !== '/admin' && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'bg-cp-primary-container text-cp-on-primary'
                  : 'text-cp-on-surface-variant hover:bg-cp-surface-container-high'
              }`}
            >
              <span className="text-base opacity-80">{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-cp-outline-variant px-4 pt-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cp-primary text-sm font-bold text-cp-on-primary">
            {fullName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-cp-on-surface">{fullName}</p>
            <p className="text-xs text-cp-on-surface-variant">{roleLabel}</p>
            {merchantLine ? (
              <p className="truncate text-xs text-cp-on-surface-variant">{merchantLine}</p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-cp-on-surface-variant hover:bg-cp-surface-container-high"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
