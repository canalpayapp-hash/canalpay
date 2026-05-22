import { createClient } from '@/lib/supabase/server';
import { colors } from '@canalpay/shared';
import { redirect } from 'next/navigation';

export default async function ClientesPage() {
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

  const { data: customers } = profile?.merchant_id
    ? await supabase
        .from('customers')
        .select('*')
        .eq('merchant_id', profile.merchant_id)
        .order('name')
    : { data: [] };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold" style={{ color: colors.navy }}>
        Clientes
      </h1>
      <ul className="bg-white rounded-xl border divide-y">
        {(customers ?? []).map((c) => (
          <li key={c.id} className="p-4 flex justify-between">
            <span className="font-medium">{c.name}</span>
            <span style={{ color: colors.gray }}>{c.phone ?? '—'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
