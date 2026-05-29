import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Pagar — CanalPay',
  description: 'Completa tu pago de forma segura',
  robots: 'noindex, nofollow',
};

/** Optimizado para webview de WhatsApp al abrir el link */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#fdf7ff',
};

export default function PagarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pay-backdrop">
      <div className="pay-sheet" role="dialog" aria-modal="true" aria-label="Pago CanalPay">
        {children}
      </div>
    </div>
  );
}
