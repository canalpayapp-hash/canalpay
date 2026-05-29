export type OrderRow = {
  amount: number | string;
  payment_status: string;
  merchant_id?: string;
  channel?: string;
  seller_id?: string | null;
};

export type DashboardMetrics = {
  ordersToday: number;
  paidToday: number;
  pendingToday: number;
  failedToday: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
  merchantsCount?: number;
};

export function computeMetricsFromOrders(
  orders: OrderRow[],
  opts?: { merchantsCount?: number }
): DashboardMetrics {
  let paidToday = 0;
  let pendingToday = 0;
  let failedToday = 0;
  let totalPaidAmount = 0;
  let totalPendingAmount = 0;

  for (const o of orders) {
    const amt = Number(o.amount);
    if (o.payment_status === 'paid') {
      paidToday++;
      totalPaidAmount += amt;
    } else if (o.payment_status === 'failed' || o.payment_status === 'refunded') {
      failedToday++;
    } else {
      pendingToday++;
      totalPendingAmount += amt;
    }
  }

  return {
    ordersToday: orders.length,
    paidToday,
    pendingToday,
    failedToday,
    totalPaidAmount,
    totalPendingAmount,
    merchantsCount: opts?.merchantsCount,
  };
}

export function groupByChannel(orders: OrderRow[]): { channel: string; total: number }[] {
  const map = new Map<string, number>();
  for (const o of orders) {
    if (o.payment_status !== 'paid') continue;
    const ch = o.channel ?? 'otro';
    map.set(ch, (map.get(ch) ?? 0) + Number(o.amount));
  }
  return [...map.entries()]
    .map(([channel, total]) => ({ channel, total }))
    .sort((a, b) => b.total - a.total);
}
