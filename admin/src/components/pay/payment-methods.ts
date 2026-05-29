import type { ComponentType } from 'react';
import { IconBank, IconCard, IconPhone } from './icons';

export type PaymentMethodId = 'pago_movil' | 'debito' | 'card';

export const PAYMENT_METHODS: {
  id: PaymentMethodId;
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    id: 'pago_movil',
    title: 'Pago móvil',
    subtitle: 'Transferencia instantánea',
    icon: IconPhone,
    iconBg: 'bg-cp-primary-container',
    iconColor: 'text-cp-on-primary',
  },
  {
    id: 'debito',
    title: 'Débito inmediato',
    subtitle: 'Cargo directo a tu cuenta',
    icon: IconBank,
    iconBg: 'bg-cp-secondary-container',
    iconColor: 'text-cp-on-secondary-container',
  },
  {
    id: 'card',
    title: 'TDC / TDD',
    subtitle: 'Tarjeta de crédito o débito',
    icon: IconCard,
    iconBg: 'bg-cp-surface-high',
    iconColor: 'text-cp-on-surface',
  },
];

export function getMethodLabel(id: string): string {
  return PAYMENT_METHODS.find((m) => m.id === id)?.title ?? id;
}
