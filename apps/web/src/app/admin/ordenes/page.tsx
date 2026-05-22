import { createClient } from '@/lib/supabase/server';
import { colors } from '@canalpay/shared';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function OrdenesPage() {
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

  const { data: orders } = profile?.merchant_id
    ? await supabase
        .from('orders')
        .select('public_code, concept, amount, currency, channel, payment_status, status, created_at, customers(name)')
        .eq('merchant_id', profile.merchant_id)
        .order('created_at', { ascending: false })
        .limit(50)
    : { data: [] };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold" style={{ color: colors.navy }}>
        Órdenes
      </h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left" style={{ color: colors.gray }}>
              <th className="p-3">Código</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Monto</th>
              <th className="p-3">Canal</th>
              <th className="p-3">Pago</th>
              <th className="p-3">Link</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => {
              const customer = o.customers as { name?: string } | null;
              return (
                <tr key={o.public_code} className="border-b last:border-0">
                  <td className="p-3 font-mono">{o.public_code}</td>
                  <td className="p-3">{customer?.name ?? '—'}</td>
                  <td className="p-3">
                    {o.amount} {o.currency}
                  </td>
                  <td className="p-3">{o.channel}</td>
                  <td className="p-3">{o.payment_status}</td>
                  <td className="p-3">
                    <Link href={`/pagar/${o.public_code}`} className="underline" style={{ color: colors.teal }}>
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
