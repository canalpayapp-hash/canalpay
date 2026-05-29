import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSessionContext } from '@/lib/auth/session';
import { SucursalesManager } from '@/components/admin/SucursalesManager';
import { merchantFilter } from '@/lib/admin/scope';

export default async function SucursalesPage() {
  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (!session.isSuperAdmin && session.profile?.role !== 'merchant_admin') {
    redirect('/admin');
  }

  const supabase = await createClient();
  const filter = merchantFilter({
    isSuperAdmin: session.isSuperAdmin,
    merchantId: session.profile?.merchant_id ?? null,
    role: session.profile?.role ?? '',
    userId: session.user.id,
  });

  let q = supabase
    .from('branches')
    .select('id, name, address, phone, status, merchant_id, merchants(name)')
    .order('name');

  if (filter.merchant_id) q = q.eq('merchant_id', filter.merchant_id);

  const { data: branches } = await q;

  const { data: merchants } = session.isSuperAdmin
    ? await supabase.from('merchants').select('id, name').order('name')
    : { data: [] };

  type BranchRow = {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    status: string;
    merchant_id: string;
    merchants: { name: string } | { name: string }[] | null;
  };

  return (
    <SucursalesManager
      branches={(branches ?? []) as BranchRow[]}
      merchants={merchants ?? []}
      isSuperAdmin={session.isSuperAdmin}
      defaultMerchantId={session.profile?.merchant_id ?? null}
    />
  );
}
