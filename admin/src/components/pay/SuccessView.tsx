'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatCurrency, type PublicOrderView } from '@canalpay/shared';
import { createClient } from '@/lib/supabase/client';
import { PayHeader } from './PayHeader';
import { PayFooter } from './PayFooter';
import { getMethodLabel } from './payment-methods';
import { IconCheck, IconReceipt, IconVerified } from './icons';

export function SuccessView({ code }: { code: string }) {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') ?? '—';
  const methodParam = searchParams.get('method') ?? 'pago_movil';

  const [order, setOrder] = useState<PublicOrderView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.rpc('get_order_for_payment', { p_public_code: code }).then(({ data }) => {
      if (data) setOrder(data as PublicOrderView);
      setLoading(false);
    });
  }, [code]);

  useEffect(() => {
    const el = document.getElementById('pay-confetti');
    if (!(el instanceof HTMLCanvasElement)) return;
    const canvasEl: HTMLCanvasElement = el;
    const ctx2d = canvasEl.getContext('2d');
    if (!ctx2d) return;
    const ctx: CanvasRenderingContext2D = ctx2d;

    let frame = 0;
    const colors = ['#4f378a', '#e1d4fd', '#008080', '#ffdf93'];
    const particles = Array.from({ length: 36 }, () => ({
      x: Math.random() * canvasEl.width,
      y: -20,
      size: Math.random() * 6 + 4,
      speed: Math.random() * 2 + 2,
      angle: Math.random() * 360,
      spin: Math.random() * 2 - 1,
      color: colors[Math.floor(Math.random() * colors.length)]!,
    }));

    function resize() {
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    function animate() {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      for (const p of particles) {
        p.y += p.speed;
        p.angle += p.spin;
        if (p.y > canvasEl.height) {
          p.y = -20;
          p.x = Math.random() * canvasEl.width;
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
      frame++;
      if (frame < 180) raf = requestAnimationFrame(animate);
    }
    const t = setTimeout(() => {
      resize();
      animate();
    }, 200);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  function closeSheet() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cp-primary border-t-transparent" />
      </div>
    );
  }

  const amount = order ? formatCurrency(Number(order.amount), order.currency) : '—';

  return (
    <>
      <canvas id="pay-confetti" className="pointer-events-none fixed inset-0 z-0" aria-hidden />
      <PayHeader showBack onBack={closeSheet} />
      <div className="pay-sheet-scroll relative z-10 flex flex-col items-center px-4 py-6">
        <div className="shadow-soft w-full max-w-md rounded-xl border border-cp-outline-variant bg-cp-surface-lowest p-6 text-center">
          <div className="success-animation mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-cp-brand-teal">
            <IconCheck className="h-16 w-16" />
          </div>
          <h2 className="text-2xl font-bold text-cp-on-surface">Pago confirmado</h2>
          <p className="mt-2 px-2 text-cp-on-surface-variant">
            Tu pedido <span className="font-bold text-cp-on-surface">{code}</span> fue pagado
            exitosamente.
          </p>

          <div className="my-6 border-y border-cp-outline-variant/30 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-cp-on-surface-variant">
              Monto total
            </p>
            <p className="text-4xl font-bold text-cp-primary">{amount}</p>
          </div>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-cp-brand-teal">
            <IconVerified />
            El comercio ya fue notificado
          </div>

          <div className="mb-6 space-y-2 rounded-lg bg-cp-surface-container p-4 text-left text-sm">
            <Row label="Referencia" value={ref.startsWith('MOCK') ? `#${ref}` : ref} />
            <Row label="Método" value={getMethodLabel(methodParam)} />
            <Row label="Fecha" value={new Date().toLocaleString('es-VE')} />
          </div>

          <button
            type="button"
            onClick={closeSheet}
            className="mb-3 flex h-14 w-full items-center justify-center rounded-lg bg-cp-primary text-lg font-semibold text-cp-on-primary shadow-lg active:scale-95"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cp-primary hover:underline"
          >
            <IconReceipt />
            Descargar comprobante
          </button>
        </div>

        {order?.merchant_name ? (
          <p className="mt-6 text-center text-xs text-cp-on-surface-variant opacity-80">
            Gracias por comprar en {order.merchant_name}
          </p>
        ) : null}
      </div>
      <PayFooter />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-cp-on-surface-variant">{label}</span>
      <span className="font-semibold text-cp-on-surface">{value}</span>
    </div>
  );
}
