import type { Currency, PaymentStatus, SalesChannel } from './types';
import { colors } from './theme';

export function getChannelLabel(channel: string): string {
  const labels: Record<SalesChannel | string, string> = {
    whatsapp: 'WhatsApp',
    instagram: 'Instagram',
    tienda: 'Tienda',
    delivery: 'Delivery',
    llamada: 'Llamada',
    otro: 'Otro',
  };
  return labels[channel] ?? channel;
}

export function getPaymentStatusLabel(status: PaymentStatus | string): string {
  const labels: Record<string, string> = {
    unpaid: 'Pendiente',
    pending: 'Pendiente',
    paid: 'Pagada',
    succeeded: 'Exitoso',
    failed: 'Fallida',
    refunded: 'Reembolsada',
  };
  return labels[status] ?? status;
}

export function getPaymentStatusColors(status: PaymentStatus | string): {
  bg: string;
  text: string;
} {
  if (status === 'paid') return { bg: colors.paidBg, text: colors.paidText };
  if (status === 'failed' || status === 'refunded')
    return { bg: colors.failedBg, text: colors.failedText };
  return { bg: colors.pendingBg, text: colors.pendingText };
}

export function formatCurrency(amount: number, currency: Currency | string): string {
  const sym = currency === 'USD' ? '$' : 'Bs.';
  const formatted = Number(amount).toLocaleString('es-VE', {
    minimumFractionDigits: currency === 'USD' ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${sym} ${formatted}`;
}

export function formatOrderDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const time = d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Hoy, ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return `Ayer, ${time}`;
  return d.toLocaleDateString('es-VE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export const SALES_CHANNELS: SalesChannel[] = [
  'whatsapp',
  'instagram',
  'tienda',
  'delivery',
  'llamada',
  'otro',
];
