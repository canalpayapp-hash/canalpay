import {
  canAccessMobileApp,
  getProfileGateStatus,
  type ProfileGateStatus,
} from '@canalpay/shared';
import type { Profile } from '@canalpay/shared';
import { supabase } from '@/lib/supabase';

export type MobileAuthContext = {
  profile: Profile | null;
  merchantName: string | null;
  branchName: string | null;
  gate: ProfileGateStatus;
  canMobile: boolean;
};

export async function fetchMobileAuthContext(): Promise<MobileAuthContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  let typedProfile = profile as Profile | null;

  if (typedProfile && !typedProfile.full_name?.trim() && user.user_metadata?.full_name) {
    typedProfile = {
      ...typedProfile,
      full_name: String(user.user_metadata.full_name).trim(),
    };
  }

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

  return {
    profile: typedProfile,
    merchantName,
    branchName,
    gate: getProfileGateStatus(typedProfile),
    canMobile: canAccessMobileApp(typedProfile?.role),
  };
}
