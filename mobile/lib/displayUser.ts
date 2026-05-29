import type { Session } from '@supabase/supabase-js';
import type { Profile } from '@canalpay/shared';

export function getDisplayName(profile: Profile | null, session: Session | null): string {
  const fromProfile = profile?.full_name?.trim();
  if (fromProfile) return fromProfile;

  const meta = session?.user?.user_metadata?.full_name;
  if (typeof meta === 'string' && meta.trim()) return meta.trim();

  const email = session?.user?.email;
  if (email) return email.split('@')[0] ?? 'Usuario';

  return 'Usuario';
}

export function getFirstName(profile: Profile | null, session: Session | null): string {
  return getDisplayName(profile, session).split(/\s+/)[0] ?? 'Usuario';
}
