import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter, useSegments } from 'expo-router';
import type { Session } from '@supabase/supabase-js';
import type { ProfileGateStatus } from '@canalpay/shared';
import type { Profile } from '@canalpay/shared';
import { fetchMobileAuthContext, type MobileAuthContext } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type AuthState = {
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  merchantName: string | null;
  branchName: string | null;
  gate: ProfileGateStatus | null;
  canMobile: boolean;
};

const AuthCtx = createContext<AuthState | null>(null);

const PUBLIC_SEGMENTS = new Set(['login', 'sin-acceso', 'perfil-incompleto', 'cuenta-inactiva']);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [state, setState] = useState<AuthState>({
    loading: true,
    session: null,
    profile: null,
    merchantName: null,
    branchName: null,
    gate: null,
    canMobile: false,
  });

  const refresh = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setState({
        loading: false,
        session: null,
        profile: null,
        merchantName: null,
        branchName: null,
        gate: null,
        canMobile: false,
      });
      return;
    }

    const ctx: MobileAuthContext | null = await fetchMobileAuthContext();
    setState({
      loading: false,
      session,
      profile: ctx?.profile ?? null,
      merchantName: ctx?.merchantName ?? null,
      branchName: ctx?.branchName ?? null,
      gate: ctx?.gate ?? 'no_profile',
      canMobile: ctx?.canMobile ?? false,
    });
  }, []);

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  useEffect(() => {
    if (state.loading) return;

    const root = segments[0] as string | undefined;
    const isPublic = !root || PUBLIC_SEGMENTS.has(root);

    if (!state.session && !isPublic) {
      router.replace('/login');
      return;
    }

    if (!state.session) return;

    if (!state.canMobile && root !== 'sin-acceso') {
      router.replace('/sin-acceso');
      return;
    }

    if (state.gate === 'inactive' && root !== 'cuenta-inactiva') {
      router.replace('/cuenta-inactiva');
      return;
    }

    if ((state.gate === 'no_profile' || state.gate === 'no_merchant') && root !== 'perfil-incompleto') {
      router.replace('/perfil-incompleto');
      return;
    }

    if (state.session && state.canMobile && state.gate === 'ok' && isPublic && root === 'login') {
      router.replace('/home');
    }
  }, [state, segments, router]);

  const value = useMemo(() => state, [state]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
