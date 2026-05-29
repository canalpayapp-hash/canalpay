import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSessionContext } from '@/lib/auth/session';
import { UsuariosManager } from '@/components/admin/UsuariosManager';

export default async function UsuariosPage() {
  const session = await getSessionContext();
  if (!session) redirect('/login');
  if (!session.isSuperAdmin && session.profile?.role !== 'merchant_admin') {
    redirect('/admin');
  }

  const supabase = await createClient();
  let q = supabase
    .from('profiles')
    .select('id, full_name, role, status, merchant_id, branch_id, merchants(name), branches(name)')
    .order('full_name');

  if (!session.isSuperAdmin && session.profile?.merchant_id) {
    q = q.eq('merchant_id', session.profile.merchant_id);
  }

  const { data: profiles } = await q;

  const { data: merchants } = session.isSuperAdmin
    ? await supabase.from('merchants').select('id, name').order('name')
    : { data: [] };

  let branches: { id: string; name: string; merchant_id: string }[] = [];
  if (session.isSuperAdmin) {
    const { data } = await supabase.from('branches').select('id, name, merchant_id').order('name');
    branches = data ?? [];
  } else if (session.profile?.merchant_id) {
    const { data } = await supabase
      .from('branches')
      .select('id, name, merchant_id')
      .eq('merchant_id', session.profile.merchant_id);
    branches = data ?? [];
  }

  return (
    <UsuariosManager
      profiles={profiles ?? []}
      merchants={merchants ?? []}
      branches={branches}
      isSuperAdmin={session.isSuperAdmin}
      defaultMerchantId={session.profile?.merchant_id ?? null}
    />
  );
}
