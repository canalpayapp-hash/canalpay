import Link from 'next/link';
import { colors } from '@canalpay/shared';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-6">
      <h1 className="text-3xl font-bold" style={{ color: colors.navy }}>
        CanalPay
      </h1>
      <p className="text-center max-w-md" style={{ color: colors.gray }}>
        Pagos para WhatsApp, Instagram, delivery y tienda física.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/login"
          className="px-6 py-3 rounded-xl text-white font-semibold"
          style={{ backgroundColor: colors.teal }}
        >
          Panel administrador
        </Link>
        <Link
          href="/pagar/CP-1002"
          className="px-6 py-3 rounded-xl font-semibold border-2"
          style={{ borderColor: colors.navy, color: colors.navy }}
        >
          Demo link de pago
        </Link>
      </div>
    </main>
  );
}
