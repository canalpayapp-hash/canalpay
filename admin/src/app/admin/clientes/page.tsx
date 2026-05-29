import { createClient } from '@/lib/supabase/server';
import { getChannelLabel } from '@canalpay/shared';
import { redirect } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getSessionContext } from '@/lib/auth/session';
import { merchantFilter } from '@/lib/admin/scope';

export default async function ClientesPage() {
  const session = await getSessionContext();
  if (!session) redirect('/login');

  const supabase = await createClient();
  const filter = merchantFilter({
    isSuperAdmin: session.isSuperAdmin,
    merchantId: session.profile?.merchant_id ?? null,
    role: session.profile?.role ?? '',
    userId: session.user.id,
  });

  let q = supabase
    .from('customers')
    .select('name, phone, email, channel_default, merchants(name)')
    .order('name');

  if (filter.merchant_id) q = q.eq('merchant_id', filter.merchant_id);

  const { data: customers } = await q;

  return (
    <div>
      <AdminPageHeader title="Clientes" subtitle="Base de clientes del comercio" />
      <ul className="divide-y divide-cp-outline-variant overflow-hidden rounded-xl border border-cp-outline-variant bg-cp-surface-container-lowest">
        {(customers ?? []).map((c, i) => {
          const merchant = c.merchants as { name?: string } | null;
          return (
            <li
              key={`${c.name}-${i}`}
              className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 hover:bg-cp-surface-container-low"
            >
              <div>
                <p className="font-semibold text-cp-on-surface">{c.name}</p>
                <p className="text-sm text-cp-on-surface-variant">
                  {c.phone ?? '—'} · {getChannelLabel(c.channel_default)}
                </p>
                {session.isSuperAdmin && merchant?.name && (
                  <p className="text-xs text-cp-primary">{merchant.name}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {(customers ?? []).length === 0 && (
        <p className="mt-4 text-center text-cp-on-surface-variant">Sin clientes</p>
      )}
    </div>
  );
}
