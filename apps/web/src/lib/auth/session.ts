import { createClient } from '@/lib/supabase/server';
import {
  canAccessWebAdmin,
  getProfileGateStatus,
  type ProfileGateStatus,
} from '@canalpay/shared';
import type { Profile } from '@canalpay/shared';

export type SessionContext = {
  user: { id: string; email?: string };
  profile: Profile | null;
  merchantName: string | null;
  branchName: string | null;
  gate: ProfileGateStatus;
  canAdmin: boolean;
};

export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createClient();
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
  let merchantName: string | null = null;
  let branchName: string | null = null;

  if (typedProfile?.merchant_id) {
    const { data: merchant } = await supabase
      .from('merchants')
      .select('name')
      .eq('id', typedProfile.merchant_id)
      .maybeSingle();
    merchantName = merchant?.name ?? null;
  }

  if (typedProfile?.branch_id) {
    const { data: branch } = await supabase
      .from('branches')
      .select('name')
      .eq('id', typedProfile.branch_id)
      .maybeSingle();
    branchName = branch?.name ?? null;
  }

  const gate = getProfileGateStatus(typedProfile);

  return {
    user: { id: user.id, email: user.email },
    profile: typedProfile,
    merchantName,
    branchName,
    gate,
    canAdmin: canAccessWebAdmin(typedProfile?.role),
  };
}
