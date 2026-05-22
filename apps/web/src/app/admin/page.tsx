import { createClient } from '@/lib/supabase/server';
import { colors, copy } from '@canalpay/shared';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, merchant_id')
    .eq('id', user.id)
    .single();

  const merchantId = profile?.merchant_id;
  let stats = {
    paidToday: 0,
    pendingToday: 0,
    totalPaid: 0,
    totalPending: 0,
    failed: 0,
  };

  if (merchantId) {
    const today = new Date().toISOString().slice(0, 10);
    const { data: orders } = await supabase
      .from('orders')
      .select('amount, payment_status, created_at')
      .eq('merchant_id', merchantId)
      .gte('created_at', `${today}T00:00:00`);

    for (const o of orders ?? []) {
      const amt = Number(o.amount);
      if (o.payment_status === 'paid') {
        stats.paidToday += 1;
        stats.totalPaid += amt;
      } else if (o.payment_status === 'pending' || o.payment_status === 'unpaid') {
        stats.pendingToday += 1;
        stats.totalPending += amt;
      } else if (o.payment_status === 'failed') {
        stats.failed += 1;
      }
    }
  }

  const cards = [
    { label: 'Órdenes pagadas hoy', value: stats.paidToday },
    { label: 'Órdenes pendientes hoy', value: stats.pendingToday },
    { label: 'Cobrado hoy', value: `$${stats.totalPaid.toFixed(2)}` },
    { label: 'Pendiente hoy', value: `$${stats.totalPending.toFixed(2)}` },
    { label: 'Pagos fallidos', value: stats.failed },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: colors.navy }}>
          Dashboard
        </h1>
        <p style={{ color: colors.gray }}>
          Hola, {profile?.full_name ?? user.email} · {copy.dashboardTagline}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-sm" style={{ color: colors.gray }}>
              {c.label}
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: colors.navy }}>
              {c.value}
            </p>
          </div>
        ))}
      </div>
      {!merchantId && (
        <p className="text-amber-700 bg-amber-50 p-4 rounded-lg">
          Tu perfil no tiene comercio asignado. Ejecuta el seed y vincula tu usuario.
        </p>
      )}
    </div>
  );
}
