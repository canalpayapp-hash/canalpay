'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { UserRole } from '@canalpay/shared';
import { createClient } from '@/lib/supabase/client';

const allLinks: { href: string; label: string; roles?: UserRole[] }[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/ordenes', label: 'Órdenes' },
  { href: '/admin/pagos', label: 'Pagos' },
  { href: '/admin/clientes', label: 'Clientes', roles: ['merchant_admin', 'super_admin'] },
  {
    href: '/admin/cierre',
    label: 'Cierre de caja',
    roles: ['merchant_admin', 'supervisor', 'super_admin'],
  },
];

export function AdminNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const router = useRouter();

  const links = allLinks.filter((l) => !l.roles || l.roles.includes(role));

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`px-3 py-2 rounded-lg text-sm ${
            pathname === l.href ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
        >
          {l.label}
        </Link>
      ))}
      <button
        type="button"
        onClick={signOut}
        className="mt-auto text-left px-3 py-2 text-sm opacity-80 hover:opacity-100"
      >
        Cerrar sesión
      </button>
    </>
  );
}
