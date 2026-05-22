'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { colors, copy, translateAuthError } from '@canalpay/shared';
import { createClient } from '@/lib/supabase/client';
import { fetchClientSessionContext } from '@/lib/auth/client-profile';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@dulcecaracas.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setLoading(false);
      setError(translateAuthError(authError.message));
      return;
    }

    const ctx = await fetchClientSessionContext();
    if (!ctx?.canAdmin) {
      await supabase.auth.signOut();
      setLoading(false);
      setError('Tu rol debe usar la app móvil CanalPay, no el panel web.');
      return;
    }

    if (ctx.gate === 'inactive') {
      await supabase.auth.signOut();
      setLoading(false);
      setError('Tu cuenta está desactivada.');
      return;
    }

    if (ctx.gate !== 'ok') {
      setLoading(false);
      router.push('/perfil-incompleto');
      return;
    }

    setLoading(false);
    router.push('/admin');
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-4"
      >
        <h1 className="text-2xl font-bold" style={{ color: colors.navy }}>
          CanalPay Admin
        </h1>
        <p className="text-sm" style={{ color: colors.gray }}>
          {copy.dashboardTagline}
        </p>
        <p className="text-xs" style={{ color: colors.gray }}>
          Acceso para administrador y supervisor del comercio.
        </p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-4 py-3"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-60"
          style={{ backgroundColor: colors.teal }}
        >
          {loading ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>
    </main>
  );
}
