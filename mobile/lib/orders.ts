import { supabase } from '@/lib/supabase';
import type { Order, PaymentStatus } from '@canalpay/shared';

const ORDER_SELECT = '*, customers(name, phone), branches(name)';

export type OrderWithRelations = Order & {
  branches?: { name: string } | null;
};

export async function fetchSellerOrders(
  sellerId: string,
  opts?: { limit?: number; paymentStatus?: PaymentStatus | PaymentStatus[] }
): Promise<OrderWithRelations[]> {
  let q = supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (opts?.paymentStatus) {
    const statuses = Array.isArray(opts.paymentStatus) ? opts.paymentStatus : [opts.paymentStatus];
    q = q.in('payment_status', statuses);
  }
  if (opts?.limit) q = q.limit(opts.limit);

  const { data } = await q;
  return (data as OrderWithRelations[]) ?? [];
}

export async function fetchOrderById(id: string): Promise<OrderWithRelations | null> {
  const { data } = await supabase.from('orders').select(ORDER_SELECT).eq('id', id).maybeSingle();
  return (data as OrderWithRelations) ?? null;
}

export async function fetchTodayMetrics(sellerId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: orders } = await supabase
    .from('orders')
    .select('amount, currency, payment_status')
    .eq('seller_id', sellerId)
    .gte('created_at', `${today}T00:00:00`);

  let collected = 0;
  let paid = 0;
  let pending = 0;
  let failed = 0;

  for (const o of orders ?? []) {
    if (o.payment_status === 'paid') {
      paid++;
      collected += Number(o.amount);
    } else if (o.payment_status === 'failed' || o.payment_status === 'refunded') {
      failed++;
    } else {
      pending++;
    }
  }

  return { collected, paid, pending, failed };
}

export function filterOrders(
  orders: OrderWithRelations[],
  query: string,
  chip: string
): OrderWithRelations[] {
  const q = query.trim().toLowerCase();
  const today = new Date().toISOString().slice(0, 10);

  return orders.filter((o) => {
    const customer = o.customers as { name?: string } | undefined;
    const matchSearch =
      !q ||
      o.public_code.toLowerCase().includes(q) ||
      (customer?.name?.toLowerCase().includes(q) ?? false);

    if (!matchSearch) return false;

    if (chip === 'today') return o.created_at.startsWith(today);
    if (chip === 'pending') return o.payment_status === 'unpaid' || o.payment_status === 'pending';
    if (chip === 'paid') return o.payment_status === 'paid';
    if (chip === 'failed') return o.payment_status === 'failed';
    return true;
  });
}
