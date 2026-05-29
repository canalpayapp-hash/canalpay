import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { copy, formatCurrency, getChannelLabel, getPaymentStatusLabel } from '@canalpay/shared';
import { redirect } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { KpiCard } from '@/components/admin/KpiCard';
import { getSessionContext } from '@/lib/auth/session';
import { computeMetricsFromOrders, groupByChannel } from '@/lib/admin/metrics';
import { merchantFilter } from '@/lib/admin/scope';

export default async function AdminDashboardPage() {
  const session = await getSessionContext();
  if (!session) redirect('/login');

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const scope = {
    isSuperAdmin: session.isSuperAdmin,
    merchantId: session.profile?.merchant_id ?? null,
    role: session.profile?.role ?? '',
    userId: session.user.id,
  };
  const filter = merchantFilter(scope);

  let ordersQuery = supabase
    .from('orders')
    .select('amount, payment_status, channel, public_code, created_at, merchants(name), customers(name)')
    .gte('created_at', `${today}T00:00:00`)
    .order('created_at', { ascending: false })
    .limit(session.isSuperAdmin ? 100 : 50);

  if (filter.merchant_id) ordersQuery = ordersQuery.eq('merchant_id', filter.merchant_id);

  const { data: ordersToday } = await ordersQuery;

  let merchantsCount = 0;
  if (session.isSuperAdmin) {
    const { count } = await supabase.from('merchants').select('*', { count: 'exact', head: true });
    merchantsCount = count ?? 0;
  }

  const metrics = computeMetricsFromOrders(ordersToday ?? [], { merchantsCount });
  const byChannel = groupByChannel(ordersToday ?? []);

  const recent = (ordersToday ?? []).slice(0, 8);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={session.isSuperAdmin ? 'Dashboard plataforma' : 'Dashboard'}
        subtitle={
          session.isSuperAdmin
            ? 'Vista global de comercios y operaciones del día'
            : `${session.merchantName ?? 'Comercio'} · ${copy.dashboardTagline}`
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {session.isSuperAdmin && (
          <KpiCard label="Comercios activos" value={merchantsCount} badge="Plataforma" />
        )}
        <KpiCard label="Órdenes hoy" value={metrics.ordersToday} />
        <KpiCard label="Pagadas hoy" value={metrics.paidToday} accent="success" />
        <KpiCard
          label="Cobrado hoy"
          value={formatCurrency(metrics.totalPaidAmount, 'USD')}
        />
        <KpiCard label="Pendientes" value={metrics.pendingToday} />
        <KpiCard
          label="Monto pendiente"
          value={formatCurrency(metrics.totalPendingAmount, 'USD')}
        />
        <KpiCard label="Fallidas" value={metrics.failedToday} accent="error" />
      </section>

      {byChannel.length > 0 && (
        <section className="rounded-xl border border-cp-outline-variant bg-cp-surface-container-lowest p-6">
          <h2 className="mb-4 text-lg font-bold text-cp-on-surface">Ventas por canal (hoy, pagadas)</h2>
          <div className="space-y-3">
            {byChannel.map((c) => {
              const max = byChannel[0]?.total ?? 1;
              const pct = Math.round((c.total / max) * 100);
              return (
                <div key={c.channel}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold">{getChannelLabel(c.channel)}</span>
                    <span className="text-cp-primary">{formatCurrency(c.total, 'USD')}</span>
                  </div>
                  <div className="h-2 rounded-full bg-cp-surface-container-high">
                    <div className="h-2 rounded-full bg-cp-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-cp-outline-variant bg-cp-surface-container-lowest">
        <div className="flex items-center justify-between border-b border-cp-outline-variant px-6 py-4">
          <h2 className="font-bold text-cp-on-surface">Órdenes recientes (hoy)</h2>
          <Link href="/admin/ordenes" className="text-sm font-semibold text-cp-primary hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-cp-surface-container-low text-xs font-bold uppercase text-cp-on-surface-variant">
              <tr>
                {session.isSuperAdmin && <th className="px-4 py-3">Comercio</th>}
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cp-outline-variant">
              {recent.map((o) => {
                const customer = o.customers as { name?: string } | null;
                const merchant = o.merchants as { name?: string } | null;
                return (
                  <tr key={o.public_code} className="hover:bg-cp-surface-container-low">
                    {session.isSuperAdmin && (
                      <td className="px-4 py-3">{merchant?.name ?? '—'}</td>
                    )}
                    <td className="px-4 py-3 font-mono text-xs">{o.public_code}</td>
                    <td className="px-4 py-3">{customer?.name ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold">
                      {formatCurrency(Number(o.amount), 'USD')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-cp-secondary-container px-2 py-0.5 text-xs font-bold text-cp-primary">
                        {getPaymentStatusLabel(o.payment_status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {recent.length === 0 && (
            <p className="p-8 text-center text-cp-on-surface-variant">Sin órdenes hoy</p>
          )}
        </div>
      </section>

      {session.isSuperAdmin && (
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/comercios"
            className="rounded-xl bg-cp-primary px-5 py-3 text-sm font-semibold text-cp-on-primary"
          >
            Gestionar comercios
          </Link>
          <Link
            href="/admin/usuarios"
            className="rounded-xl border-2 border-cp-primary px-5 py-3 text-sm font-semibold text-cp-primary"
          >
            Gestionar usuarios
          </Link>
        </div>
      )}
    </div>
  );
}
