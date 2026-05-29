'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@canalpay/shared';
import { saveCashClosureAction } from '@/app/admin/cierre/actions';
import { AdminPageHeader } from './AdminPageHeader';
import { KpiCard } from './KpiCard';

type Branch = { id: string; name: string };
type Order = { amount: number; payment_status: string; seller_id: string | null };
type Profile = { id: string; full_name: string };
type Closure = {
  id: string;
  status: string;
  closure_date: string;
};

export function CierreCaja({
  merchantId,
  branches,
  sellers,
  initialDate,
  initialBranchId,
  orders,
  existingClosure,
}: {
  merchantId: string;
  branches: Branch[];
  sellers: Profile[];
  initialDate: string;
  initialBranchId: string | null;
  orders: Order[];
  existingClosure: Closure | null;
}) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [branchId, setBranchId] = useState(initialBranchId ?? '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const metrics = useMemo(() => {
    let total_orders = orders.length;
    let total_paid = 0;
    let total_pending = 0;
    let total_failed = 0;
    let total_amount = 0;

    for (const o of orders) {
      const amt = Number(o.amount);
      total_amount += amt;
      if (o.payment_status === 'paid') total_paid += amt;
      else if (o.payment_status === 'failed') total_failed += amt;
      else total_pending += amt;
    }
    return { total_orders, total_amount, total_paid, total_pending, total_failed };
  }, [orders]);

  const bySeller = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    for (const o of orders) {
      if (o.payment_status !== 'paid') continue;
      const sid = o.seller_id ?? 'sin-vendedor';
      const cur = map.get(sid) ?? { count: 0, total: 0 };
      cur.count++;
      cur.total += Number(o.amount);
      map.set(sid, cur);
    }
    return [...map.entries()].map(([id, v]) => ({
      id,
      name: sellers.find((s) => s.id === id)?.full_name ?? 'Sin asignar',
      ...v,
    }));
  }, [orders, sellers]);

  async function save(markReviewed: boolean) {
    setLoading(true);
    setMessage(null);
    try {
      await saveCashClosureAction({
        merchant_id: merchantId,
        branch_id: branchId || null,
        closure_date: date,
        ...metrics,
        mark_reviewed: markReviewed,
      });
      setMessage(markReviewed ? 'Cierre marcado como revisado' : 'Borrador guardado');
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Error');
    }
    setLoading(false);
  }

  return (
    <div>
      <AdminPageHeader
        title="Cierre de caja"
        subtitle="Gestión y auditoría de transacciones diarias"
      />

      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-cp-outline">Sucursal</label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="rounded-xl border border-cp-outline-variant bg-cp-surface-container-lowest px-3 py-2"
          >
            <option value="">Todas</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-cp-outline">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-cp-outline-variant bg-cp-surface-container-lowest px-3 py-2"
          />
        </div>
        {existingClosure && (
          <div className="flex items-end">
            <span className="rounded-full bg-cp-secondary-container px-3 py-1 text-xs font-bold text-cp-primary">
              {existingClosure.status === 'reviewed' ? 'Revisado' : 'Borrador'}
            </span>
          </div>
        )}
      </div>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Total órdenes" value={metrics.total_orders} />
        <KpiCard label="Total pagado" value={formatCurrency(metrics.total_paid, 'USD')} />
        <KpiCard label="Total pendiente" value={formatCurrency(metrics.total_pending, 'USD')} />
        <KpiCard label="Total fallido" value={formatCurrency(metrics.total_failed, 'USD')} accent="error" />
        <KpiCard
          label="Total conciliado"
          value={formatCurrency(metrics.total_paid, 'USD')}
          badge="MVP = pagado"
        />
      </section>

      <section className="mb-8 overflow-hidden rounded-xl border border-cp-outline-variant bg-cp-surface-container-lowest">
        <div className="border-b border-cp-outline-variant bg-cp-surface-container-low px-6 py-4">
          <h3 className="font-bold text-cp-on-surface">Desglose por vendedor (pagadas)</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs font-bold uppercase text-cp-on-surface-variant">
            <tr>
              <th className="px-6 py-3 text-left">Vendedor</th>
              <th className="px-6 py-3 text-left">Órdenes</th>
              <th className="px-6 py-3 text-right">Venta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cp-outline-variant">
            {bySeller.map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-3 font-semibold">{s.name}</td>
                <td className="px-6 py-3">{s.count}</td>
                <td className="px-6 py-3 text-right font-bold text-cp-primary">
                  {formatCurrency(s.total, 'USD')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bySeller.length === 0 && (
          <p className="p-6 text-center text-cp-on-surface-variant">Sin ventas pagadas en esta fecha</p>
        )}
      </section>

      {message && (
        <p className="mb-4 rounded-lg bg-cp-secondary-container px-4 py-2 text-sm text-cp-primary">
          {message}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3 border-t border-cp-outline-variant pt-6">
        <button
          type="button"
          disabled={loading}
          onClick={() => save(false)}
          className="rounded-xl border-2 border-cp-primary px-8 py-3 font-bold text-cp-primary disabled:opacity-50"
        >
          Guardar borrador
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => save(true)}
          className="rounded-xl bg-cp-primary px-8 py-3 font-bold text-cp-on-primary shadow-lg disabled:opacity-50"
        >
          Marcar como revisado
        </button>
      </div>
    </div>
  );
}
