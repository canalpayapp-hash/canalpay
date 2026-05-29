import { supabase } from '@/lib/supabase';

export async function sendRegistrationOtp(email: string, fullName: string) {
  const normalized = email.trim().toLowerCase();
  return supabase.auth.signInWithOtp({
    email: normalized,
    options: {
      shouldCreateUser: true,
      data: { full_name: fullName.trim() },
    },
  });
}

export async function verifyRegistrationOtp(email: string, token: string) {
  return supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: 'email',
  });
}

export async function ensureMobileSellerProfile(fullName: string, phone?: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'No autenticado' };

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
  if (existing) return { ok: true as const };

  const { error } = await supabase.rpc('complete_mobile_registration', {
    p_full_name: fullName.trim(),
    p_phone: phone?.trim() || null,
  });

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
