import type { CreatePaymentInput, CreatePaymentResult, PaymentProvider } from './types';

function mockRef(): string {
  return `MOCK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

export class MockPaymentProvider implements PaymentProvider {
  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const ref = mockRef();
    return {
      provider: 'mock',
      providerReference: ref,
      status: 'pending',
      paymentUrl: `/pagar-simulado?order=${input.orderId}`,
      rawPayload: { simulated: true, input },
    };
  }

  async getPaymentStatus(providerReference: string): Promise<CreatePaymentResult> {
    return {
      provider: 'mock',
      providerReference,
      status: 'pending',
      rawPayload: { simulated: true },
    };
  }

  async simulate(
    outcome: 'succeeded' | 'pending' | 'failed'
  ): Promise<CreatePaymentResult> {
    return {
      provider: 'mock',
      providerReference: mockRef(),
      status: outcome === 'succeeded' ? 'succeeded' : outcome === 'pending' ? 'pending' : 'failed',
      rawPayload: { simulated: true, outcome },
    };
  }
}
