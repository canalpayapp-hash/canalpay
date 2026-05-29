'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  copy,
  formatCurrency,
  getPaymentStatusLabel,
  type PublicOrderView,
} from '@canalpay/shared';
import { createClient } from '@/lib/supabase/client';
import { PayHeader } from './PayHeader';
import { PayFooter } from './PayFooter';
import { PAYMENT_METHODS, type PaymentMethodId } from './payment-methods';
import { IconLock, IconVerified } from './icons';

export function CheckoutView({ code }: { code: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<PublicOrderView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState<PaymentMethodId>('pago_movil');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error: rpcError } = await supabase.rpc('get_order_for_payment', {
        p_public_code: code,
      });
      if (rpcError) {
        setError(rpcError.message);
        setLoading(false);
        return;
      }
      if (!data) {
        setError('Orden no encontrada');
        setLoading(false);
        return;
      }
      const o = data as PublicOrderView;
      setOrder(o);
      setLoading(false);

      if (o.payment_status === 'paid' || !o.can_pay) {
        router.replace(`/pagar/${code}/exito`);
      }
    }
    load();
  }, [code, router]);

  async function payNow() {
    setPaying(true);
    setError(null);
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc('simulate_order_payment', {
      p_public_code: code,
      p_outcome: 'succeeded',
      p_method: method,
    });
    setPaying(false);

    if (rpcError) {
      setError(translatePayError(rpcError.message));
      return;
    }

    const result = data as { provider_reference?: string; outcome?: string } | null;
    const ref = result?.provider_reference ?? '';
    const params = new URLSearchParams({ method, ref });
    router.push(`/pagar/${code}/exito?${params.toString()}`);
  }

  if (loading) {
    return (
      <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-3 p-8">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cp-primary border-t-transparent" />
        <p className="text-sm text-cp-on-surface-variant">Cargando tu orden…</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <>
        <PayHeader />
        <div className="pay-sheet-scroll p-6 text-center">
          <p className="text-lg font-semibold text-cp-on-surface">No pudimos cargar el pago</p>
          <p className="mt-2 text-sm text-cp-error">{error}</p>
          <p className="mt-4 text-xs text-cp-on-surface-variant">
            Verifica el link que te enviaron por WhatsApp o pide uno nuevo al comercio.
          </p>
        </div>
        <PayFooter />
      </>
    );
  }

  if (!order) return null;

  const statusLabel = getPaymentStatusLabel(order.payment_status);
  const canPay = order.can_pay;

  return (
    <>
      <PayHeader merchantName={order.merchant_name} logoUrl={order.merchant_logo_url} />
      <div className="pay-sheet-scroll px-4 pb-4 pt-5">
        <section className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-cp-on-surface">{order.merchant_name}</h1>
          <p className="mt-1 text-cp-on-surface-variant">{copy.publicPayTagline}</p>
        </section>

        <section className="shadow-soft relative mb-6 overflow-hidden rounded-xl border border-cp-outline-variant bg-cp-surface-lowest p-6">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <IconReceiptDecor />
          </div>
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-cp-on-surface-variant">
                Orden #{order.public_code}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-cp-on-surface">{order.concept}</h2>
            </div>
            <span className="shrink-0 rounded-full bg-cp-secondary-container px-3 py-1 text-xs font-semibold text-cp-on-secondary-container">
              {statusLabel}
            </span>
          </div>
          <div className="relative mt-4 border-t border-cp-outline-variant pt-4">
            <p className="text-xs font-semibold text-cp-on-surface-variant">Monto total</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-cp-primary">
                {formatCurrency(Number(order.amount), order.currency)}
              </span>
              <span className="text-sm text-cp-on-surface-variant">{order.currency}</span>
            </div>
          </div>
        </section>

        {canPay ? (
          <>
            <section className="mb-6">
              <h3 className="mb-4 text-lg font-semibold text-cp-on-surface">Selecciona el método de pago</h3>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((m) => {
                  const Icon = m.icon;
                  const selected = method === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all active:scale-[0.98] ${
                        selected ? 'pay-method-selected' : 'border-cp-outline-variant bg-cp-surface-lowest'
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${m.iconBg} ${m.iconColor}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-cp-on-surface">{m.title}</p>
                        <p className="text-sm text-cp-on-surface-variant">{m.subtitle}</p>
                      </div>
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                          selected ? 'border-cp-primary bg-cp-primary' : 'border-cp-outline-variant'
                        }`}
                      >
                        {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="mb-4 flex items-center justify-center gap-2 text-cp-on-surface-variant">
              <IconVerified className="text-cp-primary" />
              <p className="text-sm">Pago procesado de forma segura por CanalPay</p>
            </div>

            {error ? <p className="mb-3 text-center text-sm text-cp-error">{error}</p> : null}

            <button
              type="button"
              disabled={paying}
              onClick={payNow}
              className="mb-4 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-cp-primary text-lg font-semibold text-cp-on-primary shadow-lg transition active:scale-[0.97] disabled:opacity-60"
            >
              {paying ? 'Procesando…' : 'Pagar ahora'}
              {!paying ? <IconLock /> : null}
            </button>
            <p className="text-center text-[11px] text-cp-on-surface-variant">
              En esta demo el pago es simulado; no se debita tu cuenta bancaria.
            </p>
          </>
        ) : (
          <div className="rounded-xl border border-cp-outline-variant bg-cp-surface-container p-4 text-center">
            <p className="font-medium text-cp-on-surface">Esta orden ya no acepta pagos</p>
            <p className="mt-1 text-sm text-cp-on-surface-variant">Estado: {statusLabel}</p>
            <button
              type="button"
              onClick={() => router.push(`/pagar/${code}/exito`)}
              className="mt-4 text-sm font-semibold text-cp-primary underline"
            >
              Ver comprobante
            </button>
          </div>
        )}
      </div>
      <PayFooter />
    </>
  );
}

function translatePayError(msg: string): string {
  if (msg.includes('cannot be paid')) return 'Esta orden ya fue pagada o fue cancelada.';
  if (msg.includes('not found')) return 'Orden no encontrada.';
  return msg;
}

function IconReceiptDecor() {
  return (
    <svg className="h-20 w-20 text-cp-primary" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z" />
    </svg>
  );
}
