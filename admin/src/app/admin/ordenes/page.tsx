import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatCurrency, getChannelLabel, getPaymentStatusLabel } from '@canalpay/shared';
import { redirect } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getSessionContext } from '@/lib/auth/session';
import { merchantFilter } from '@/lib/admin/scope';

export default async function OrdenesPage() {
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
    .from('orders')
    .select(
      'public_code, concept, amount, currency, channel, payment_status, created_at, customers(name), merchants(name)'
    )
    .order('created_at', { ascending: false })
    .limit(80);

  if (filter.merchant_id) q = q.eq('merchant_id', filter.merchant_id);

  const { data: orders } = await q;

  return (
    <div>
      <AdminPageHeader title="Órdenes" subtitle="Listado y seguimiento de cobros" />
      <div className="overflow-hidden rounded-xl border border-cp-outline-variant bg-cp-surface-container-lowest">
        <table className="w-full text-sm">
          <thead className="bg-cp-surface-container-low text-xs font-bold uppercase text-cp-on-surface-variant">
            <tr>
              {session.isSuperAdmin && <th className="px-4 py-3">Comercio</th>}
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Canal</th>
              <th className="px-4 py-3">Pago</th>
              <th className="px-4 py-3">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cp-outline-variant">
            {(orders ?? []).map((o) => {
              const customer = o.customers as { name?: string } | null;
              const merchant = o.merchants as { name?: string } | null;
              return (
                <tr key={o.public_code} className="hover:bg-cp-surface-container-low">
                  {session.isSuperAdmin && <td className="px-4 py-3">{merchant?.name ?? '—'}</td>}
                  <td className="px-4 py-3 font-mono text-xs">{o.public_code}</td>
                  <td className="px-4 py-3">{customer?.name ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold">
                    {formatCurrency(Number(o.amount), o.currency)}
                  </td>
                  <td className="px-4 py-3">{getChannelLabel(o.channel)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-cp-secondary-container px-2 py-0.5 text-xs font-bold text-cp-primary">
                      {getPaymentStatusLabel(o.payment_status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/pagar/${o.public_code}`}
                      className="font-semibold text-cp-primary hover:underline"
                      target="_blank"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
