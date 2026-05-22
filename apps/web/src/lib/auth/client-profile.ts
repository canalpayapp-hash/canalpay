import { createClient } from '@/lib/supabase/client';
import {
  canAccessWebAdmin,
  getProfileGateStatus,
  type ProfileGateStatus,
} from '@canalpay/shared';
import type { Profile } from '@canalpay/shared';

export type ClientSessionContext = {
  profile: Profile | null;
  gate: ProfileGateStatus;
  canAdmin: boolean;
};

export async function fetchClientSessionContext(): Promise<ClientSessionContext | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  const typedProfile = profile as Profile | null;
  return {
    profile: typedProfile,
    gate: getProfileGateStatus(typedProfile),
    canAdmin: canAccessWebAdmin(typedProfile?.role),
  };
}
