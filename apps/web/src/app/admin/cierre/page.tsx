import { createClient } from '@/lib/supabase/server';
import { colors } from '@canalpay/shared';
import { redirect } from 'next/navigation';

export default async function CierrePage() {
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

  const today = new Date().toISOString().slice(0, 10);
  const { data: orders } = profile?.merchant_id
    ? await supabase
        .from('orders')
        .select('amount, payment_status')
        .eq('merchant_id', profile.merchant_id)
        .gte('created_at', `${today}T00:00:00`)
    : { data: [] };

  let totalOrders = orders?.length ?? 0;
  let totalPaid = 0;
  let totalPending = 0;
  let totalFailed = 0;

  for (const o of orders ?? []) {
    const amt = Number(o.amount);
    if (o.payment_status === 'paid') totalPaid += amt;
    else if (o.payment_status === 'failed') totalFailed += amt;
    else totalPending += amt;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold" style={{ color: colors.navy }}>
        Cierre de caja — {today}
      </h1>
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        {[
          ['Órdenes creadas', totalOrders],
          ['Total pagado', `$${totalPaid.toFixed(2)}`],
          ['Total pendiente', `$${totalPending.toFixed(2)}`],
          ['Total fallido', `$${totalFailed.toFixed(2)}`],
        ].map(([label, value]) => (
          <div key={label as string} className="bg-white rounded-xl p-4 border">
            <p className="text-sm" style={{ color: colors.gray }}>
              {label}
            </p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
