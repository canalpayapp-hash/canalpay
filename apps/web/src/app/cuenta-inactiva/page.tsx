'use client';

import { useRouter } from 'next/navigation';
import { colors } from '@canalpay/shared';
import { createClient } from '@/lib/supabase/client';

export default function CuentaInactivaPage() {
  const router = useRouter();

  async function salir() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-4 text-center">
        <h1 className="text-xl font-bold" style={{ color: colors.navy }}>
          Cuenta desactivada
        </h1>
        <p style={{ color: colors.gray }}>
          Tu usuario fue desactivado. Contacta al administrador del comercio para reactivarlo.
        </p>
        <button
          type="button"
          onClick={salir}
          className="w-full py-3 rounded-xl text-white font-semibold"
          style={{ backgroundColor: colors.teal }}
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  );
}
