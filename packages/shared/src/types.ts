export type UserRole =
  | 'super_admin'
  | 'merchant_admin'
  | 'supervisor'
  | 'seller'
  | 'cashier';

export type OrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'paid'
  | 'partially_paid'
  | 'rejected'
  | 'expired'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';

export type Currency = 'VES' | 'USD';

export type SalesChannel =
  | 'whatsapp'
  | 'instagram'
  | 'tienda'
  | 'delivery'
  | 'llamada'
  | 'otro';

export interface Profile {
  id: string;
  merchant_id: string | null;
  branch_id: string | null;
  full_name: string;
  phone: string | null;
  role: UserRole;
  status: string;
}

export interface Merchant {
  id: string;
  name: string;
  rif: string | null;
  logo_url: string | null;
  status: string;
}

export interface Branch {
  id: string;
  merchant_id: string;
  name: string;
  status: string;
}

export interface Customer {
  id: string;
  merchant_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  channel_default: string;
}

export interface Order {
  id: string;
  public_code: string;
  merchant_id: string;
  branch_id: string | null;
  customer_id: string | null;
  seller_id: string | null;
  channel: string;
  concept: string;
  amount: number;
  currency: Currency;
  status: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_status: string;
  payment_link: string | null;
  qr_payload: string | null;
  notes: string | null;
  created_at: string;
  customers?: Pick<Customer, 'name' | 'phone'> | null;
}

export interface PublicOrderView {
  public_code: string;
  concept: string;
  amount: number;
  currency: string;
  channel: string;
  status: string;
  payment_status: string;
  merchant_name: string;
  merchant_logo_url: string | null;
  can_pay: boolean;
}
