import type { CreatePaymentInput, CreatePaymentResult, PaymentProvider } from './types';

/**
 * Placeholder para integración Bancaribe (fase 2).
 * Métodos previstos: createC2PCharge, createDebitCharge, createCardButtonCharge,
 * handlePaymentNotification, consultOperation, reconcilePayment.
 */
export class BancaribePaymentProvider implements PaymentProvider {
  async createPayment(_input: CreatePaymentInput): Promise<CreatePaymentResult> {
    throw new Error('BancaribePaymentProvider no implementado en MVP');
  }

  async getPaymentStatus(_providerReference: string): Promise<CreatePaymentResult> {
    throw new Error('BancaribePaymentProvider no implementado en MVP');
  }
}
