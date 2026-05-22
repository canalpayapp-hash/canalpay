import { createClient } from '@/lib/supabase/server';
import { colors } from '@canalpay/shared';
import { redirect } from 'next/navigation';

export default async function PagosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('merchant_id')
    .eq('id', user.id)
    .single();

  const { data: payments } = profile?.merchant_id
    ? await supabase
        .from('payments')
        .select('provider_reference, amount, currency, status, method, created_at, orders(public_code)')
        .eq('merchant_id', profile.merchant_id)
        .order('created_at', { ascending: false })
        .limit(50)
    : { data: [] };

  const { data: matches } = profile?.merchant_id
    ? await supabase
        .from('reconciliation_matches')
        .select('match_status, confidence_score, orders(public_code)')
        .eq('merchant_id', profile.merchant_id)
        .limit(50)
    : { data: [] };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: colors.navy }}>
        Pagos y conciliación
      </h1>
      <section>
        <h2 className="font-semibold mb-2">Pagos</h2>
        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ color: colors.gray }}>
                <th className="p-3">Ref</th>
                <th className="p-3">Orden</th>
                <th className="p-3">Monto</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {(payments ?? []).map((p) => {
                const order = p.orders as { public_code?: string } | null;
                return (
                  <tr key={p.provider_reference} className="border-b">
                    <td className="p-3 font-mono text-xs">{p.provider_reference}</td>
                    <td className="p-3">{order?.public_code ?? '—'}</td>
                    <td className="p-3">
                      {p.amount} {p.currency}
                    </td>
                    <td className="p-3">{p.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 className="font-semibold mb-2">Conciliados ({matches?.length ?? 0})</h2>
        <p className="text-sm" style={{ color: colors.gray }}>
          En MVP, pagos desde el link se concilian automáticamente al 100%.
        </p>
      </section>
    </div>
  );
}
