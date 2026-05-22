import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  canAccessWebAdmin,
  getProfileGateStatus,
} from '@canalpay/shared';

const GATE_ROUTES: Record<string, string> = {
  inactive: '/cuenta-inactiva',
  no_profile: '/perfil-incompleto',
  no_merchant: '/perfil-incompleto',
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isGatePage =
    path.startsWith('/sin-acceso') ||
    path.startsWith('/perfil-incompleto') ||
    path.startsWith('/cuenta-inactiva');

  if (!user) {
    if (path.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status, merchant_id')
    .eq('id', user.id)
    .maybeSingle();

  const role = profile?.role as string | undefined;
  const gate = getProfileGateStatus(
    profile
      ? {
          role: role ?? 'seller',
          status: profile.status ?? 'active',
          merchant_id: profile.merchant_id,
        }
      : null
  );

  if (path === '/login') {
    if (!canAccessWebAdmin(role)) {
      const url = new URL('/sin-acceso', request.url);
      url.searchParams.set('motivo', 'mobile');
      return NextResponse.redirect(url);
    }
    if (gate !== 'ok') {
      return NextResponse.redirect(new URL(GATE_ROUTES[gate], request.url));
    }
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  if (path.startsWith('/admin')) {
    if (!canAccessWebAdmin(role)) {
      const url = new URL('/sin-acceso', request.url);
      url.searchParams.set('motivo', 'mobile');
      return NextResponse.redirect(url);
    }
    if (gate !== 'ok' && !isGatePage) {
      return NextResponse.redirect(new URL(GATE_ROUTES[gate], request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
