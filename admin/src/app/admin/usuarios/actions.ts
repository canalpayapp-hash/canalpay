'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/admin';
import type { UserRole } from '@canalpay/shared';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, merchant_id')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('Sin perfil');
  return { supabase, user, profile };
}

export async function updateProfileAction(input: {
  id: string;
  full_name: string;
  role: UserRole;
  merchant_id: string | null;
  branch_id: string | null;
  status: string;
}) {
  const { supabase, profile } = await requireAdmin();
  const isSuper = profile.role === 'super_admin';

  if (!isSuper) {
    if (profile.role !== 'merchant_admin') throw new Error('Sin permiso');
    if (input.role === 'super_admin') throw new Error('No puedes asignar super admin');
    const { data: target } = await supabase.from('profiles').select('merchant_id').eq('id', input.id).single();
    if (target?.merchant_id !== profile.merchant_id) throw new Error('Usuario de otro comercio');
    input.merchant_id = profile.merchant_id;
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: input.full_name,
      role: input.role,
      merchant_id: input.role === 'super_admin' ? null : input.merchant_id,
      branch_id: input.branch_id,
      status: input.status,
    })
    .eq('id', input.id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/usuarios');
}

export async function inviteUserAction(input: {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  merchant_id: string | null;
  branch_id: string | null;
}) {
  const { profile } = await requireAdmin();
  const isSuper = profile.role === 'super_admin';

  if (!isSuper && profile.role !== 'merchant_admin') throw new Error('Sin permiso');
  if (!isSuper && input.role === 'super_admin') throw new Error('Sin permiso');
  if (!isSuper) input.merchant_id = profile.merchant_id;

  const admin = createServiceClient();
  if (!admin) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY en el servidor');

  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.full_name },
  });

  if (authErr) throw new Error(authErr.message);

  const { error: profErr } = await admin.from('profiles').upsert({
    id: authData.user.id,
    full_name: input.full_name,
    role: input.role,
    merchant_id: input.role === 'super_admin' ? null : input.merchant_id,
    branch_id: input.branch_id,
    status: 'active',
  });

  if (profErr) throw new Error(profErr.message);
  revalidatePath('/admin/usuarios');
}
