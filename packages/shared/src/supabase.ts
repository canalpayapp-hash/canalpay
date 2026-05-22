import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function createSupabaseClient(url: string, anonKey: string): SupabaseClient {
  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export function buildPaymentLink(baseUrl: string, publicCode: string): string {
  const base = baseUrl.replace(/\/$/, '');
  return `${base}/pagar/${publicCode}`;
}
