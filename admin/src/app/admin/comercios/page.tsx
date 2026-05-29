import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSessionContext } from '@/lib/auth/session';
import { ComerciosManager } from '@/components/admin/ComerciosManager';

export default async function ComerciosPage() {
  const session = await getSessionContext();
  if (!session?.isSuperAdmin) redirect('/admin');

  const supabase = await createClient();
  const { data: merchants } = await supabase
    .from('merchants')
    .select('id, name, rif, email, phone, status, created_at')
    .order('name');

  return <ComerciosManager initialMerchants={merchants ?? []} />;
}
