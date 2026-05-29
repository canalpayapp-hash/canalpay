export interface CreatePaymentInput {
  orderId: string;
  amount: number;
  currency: 'VES' | 'USD';
  customerName?: string;
  customerPhone?: string;
  method?: string;
}

export interface CreatePaymentResult {
  provider: string;
  providerReference: string;
  status: 'pending' | 'succeeded' | 'failed';
  paymentUrl?: string;
  rawPayload?: Record<string, unknown>;
}

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  getPaymentStatus(providerReference: string): Promise<CreatePaymentResult>;
}
