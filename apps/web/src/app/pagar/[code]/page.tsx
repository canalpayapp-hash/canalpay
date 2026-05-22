'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { colors, copy, type PublicOrderView } from '@canalpay/shared';
import { createClient } from '@/lib/supabase/client';

export default function PagarPage() {
  const params = useParams();
  const code = params.code as string;
  const [order, setOrder] = useState<PublicOrderView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc('get_order_for_payment', {
        p_public_code: code,
      });
      if (rpcError) setError(rpcError.message);
      else if (!data) setError('Orden no encontrada');
      else setOrder(data as PublicOrderView);
      setLoading(false);
    }
    load();
  }, [code]);

  async function simulate(outcome: 'succeeded' | 'pending' | 'failed') {
    setPaying(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc('simulate_order_payment', {
      p_public_code: code,
      p_outcome: outcome,
      p_method: 'mock',
    });
    setPaying(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setDone(outcome);
    const { data } = await supabase.rpc('get_order_for_payment', { p_public_code: code });
    if (data) setOrder(data as PublicOrderView);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Cargando…</p>
      </main>
    );
  }

  if (error && !order) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  if (!order) return null;

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-4">
        <h1 className="text-xl font-bold" style={{ color: colors.navy }}>
          {order.merchant_name}
        </h1>
        <p className="text-sm" style={{ color: colors.gray }}>
          {copy.publicPayTagline}
        </p>
        <div className="space-y-1 text-sm">
          <p>
            <span style={{ color: colors.gray }}>Orden:</span>{' '}
            <strong>{order.public_code}</strong>
          </p>
          <p>
            <span style={{ color: colors.gray }}>Concepto:</span> {order.concept}
          </p>
          <p className="text-2xl font-bold" style={{ color: colors.teal }}>
            {order.amount} {order.currency}
          </p>
          <p>
            <span style={{ color: colors.gray }}>Estado:</span> {order.payment_status}
          </p>
        </div>

        {order.can_pay && !done && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium" style={{ color: colors.gray }}>
              Métodos simulados (MVP)
            </p>
            <button
              type="button"
              disabled={paying}
              onClick={() => simulate('succeeded')}
              className="w-full py-3 rounded-xl text-white font-semibold"
              style={{ backgroundColor: colors.teal }}
            >
              Simular pago exitoso
            </button>
            <button
              type="button"
              disabled={paying}
              onClick={() => simulate('pending')}
              className="w-full py-3 rounded-xl font-semibold border"
            >
              Simular pendiente
            </button>
            <button
              type="button"
              disabled={paying}
              onClick={() => simulate('failed')}
              className="w-full py-3 rounded-xl text-white font-semibold"
              style={{ backgroundColor: colors.danger }}
            >
              Simular rechazado
            </button>
          </div>
        )}

        {done && (
          <p className="text-green-700 font-medium">
            Resultado: {done === 'succeeded' ? 'Pago exitoso' : done}
          </p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </main>
  );
}
