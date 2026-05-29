import { createClient } from '@/lib/supabase/server';
import { formatCurrency, getPaymentStatusLabel } from '@canalpay/shared';
import { redirect } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { getSessionContext } from '@/lib/auth/session';
import { merchantFilter } from '@/lib/admin/scope';

export default async function PagosPage() {
  const session = await getSessionContext();
  if (!session) redirect('/login');

  const supabase = await createClient();
  const filter = merchantFilter({
    isSuperAdmin: session.isSuperAdmin,
    merchantId: session.profile?.merchant_id ?? null,
    role: session.profile?.role ?? '',
    userId: session.user.id,
  });

  let payQ = supabase
    .from('payments')
    .select('provider_reference, amount, currency, status, method, created_at, orders(public_code), merchants(name)')
    .order('created_at', { ascending: false })
    .limit(60);

  if (filter.merchant_id) payQ = payQ.eq('merchant_id', filter.merchant_id);

  const { data: payments } = await payQ;

  let recQ = supabase
    .from('reconciliation_matches')
    .select('match_status, confidence_score, orders(public_code)')
    .limit(30);

  if (filter.merchant_id) recQ = recQ.eq('merchant_id', filter.merchant_id);

  const { data: matches } = await recQ;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Pagos y conciliación"
        subtitle="Registro de pagos y matches automáticos (MVP)"
      />
      <section className="overflow-hidden rounded-xl border border-cp-outline-variant bg-cp-surface-container-lowest">
        <h2 className="border-b border-cp-outline-variant px-6 py-4 font-bold">Pagos</h2>
        <table className="w-full text-sm">
          <thead className="bg-cp-surface-container-low text-xs font-bold uppercase text-cp-on-surface-variant">
            <tr>
              {session.isSuperAdmin && <th className="px-4 py-3">Comercio</th>}
              <th className="px-4 py-3">Referencia</th>
              <th className="px-4 py-3">Orden</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cp-outline-variant">
            {(payments ?? []).map((p) => {
              const order = p.orders as { public_code?: string } | null;
              const merchant = p.merchants as { name?: string } | null;
              return (
                <tr key={p.provider_reference} className="hover:bg-cp-surface-container-low">
                  {session.isSuperAdmin && <td className="px-4 py-3">{merchant?.name ?? '—'}</td>}
                  <td className="px-4 py-3 font-mono text-xs">{p.provider_reference}</td>
                  <td className="px-4 py-3">{order?.public_code ?? '—'}</td>
                  <td className="px-4 py-3">{formatCurrency(Number(p.amount), p.currency)}</td>
                  <td className="px-4 py-3">{p.method}</td>
                  <td className="px-4 py-3">{getPaymentStatusLabel(p.status)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <section className="rounded-xl border border-cp-outline-variant bg-cp-surface-container-low p-4">
        <p className="text-sm text-cp-on-surface-variant">
          Conciliaciones registradas: <strong>{matches?.length ?? 0}</strong> (automáticas al simular pago
          exitoso).
        </p>
      </section>
    </div>
  );
}
