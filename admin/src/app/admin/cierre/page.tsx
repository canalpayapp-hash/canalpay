import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSessionContext } from '@/lib/auth/session';
import { CierreCaja } from '@/components/admin/CierreCaja';

type Props = { searchParams: Promise<{ fecha?: string; sucursal?: string; comercio?: string }> };

export default async function CierrePage({ searchParams }: Props) {
  const session = await getSessionContext();
  if (!session) redirect('/login');

  const params = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const date = params.fecha ?? today;
  const branchParam = params.sucursal ?? '';

  const supabase = await createClient();
  const effectiveMerchantId =
    session.profile?.merchant_id ?? (session.isSuperAdmin ? params.comercio : null) ?? null;

  if (!effectiveMerchantId) {
    if (session.isSuperAdmin) {
      const { data: merchants } = await supabase.from('merchants').select('id, name').order('name');
      return (
        <div>
          <h1 className="mb-4 text-2xl font-bold text-cp-primary">Cierre de caja</h1>
          <p className="mb-4 text-cp-on-surface-variant">Selecciona un comercio:</p>
          <ul className="space-y-2">
            {(merchants ?? []).map((m) => (
              <li key={m.id}>
                <a
                  href={`/admin/cierre?comercio=${m.id}`}
                  className="font-semibold text-cp-primary hover:underline"
                >
                  {m.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return (
      <p className="rounded-lg bg-amber-50 p-4 text-amber-800">
        Asigna un comercio a tu perfil para usar cierre de caja.
      </p>
    );
  }

  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .eq('merchant_id', effectiveMerchantId)
    .eq('status', 'active');

  let ordersQuery = supabase
    .from('orders')
    .select('amount, payment_status, seller_id')
    .eq('merchant_id', effectiveMerchantId)
    .gte('created_at', `${date}T00:00:00`)
    .lt('created_at', `${date}T23:59:59.999`);

  if (branchParam) ordersQuery = ordersQuery.eq('branch_id', branchParam);

  const { data: orders } = await ordersQuery;

  const { data: sellers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('merchant_id', effectiveMerchantId)
    .in('role', ['seller', 'cashier']);

  let closureQuery = supabase
    .from('cash_closures')
    .select('id, status, closure_date')
    .eq('merchant_id', effectiveMerchantId)
    .eq('closure_date', date);

  if (branchParam) closureQuery = closureQuery.eq('branch_id', branchParam);
  else closureQuery = closureQuery.is('branch_id', null);

  const { data: closure } = await closureQuery.maybeSingle();

  return (
    <CierreCaja
      merchantId={effectiveMerchantId}
      branches={branches ?? []}
      sellers={sellers ?? []}
      initialDate={date}
      initialBranchId={branchParam || null}
      orders={orders ?? []}
      existingClosure={closure}
    />
  );
}
