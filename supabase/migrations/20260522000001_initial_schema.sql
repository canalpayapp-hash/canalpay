-- CanalPay MVP — schema inicial

create extension if not exists "pgcrypto";

-- Comercios
create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rif text,
  phone text,
  email text,
  address text,
  logo_url text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Sucursales
create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  name text not null,
  address text,
  phone text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Perfiles (vinculados a auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  merchant_id uuid references public.merchants(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  full_name text not null,
  phone text,
  role text not null check (role in (
    'super_admin', 'merchant_admin', 'supervisor', 'seller', 'cashier'
  )),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Clientes
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  document_id text,
  channel_default text not null default 'whatsapp',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Órdenes de cobro
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  public_code text unique not null,
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  seller_id uuid references public.profiles(id) on delete set null,
  channel text not null default 'whatsapp',
  concept text not null,
  amount numeric(14, 2) not null check (amount > 0),
  currency text not null default 'VES' check (currency in ('VES', 'USD')),
  exchange_rate numeric(14, 4),
  due_date timestamptz,
  status text not null default 'pending_payment' check (status in (
    'draft', 'pending_payment', 'paid', 'partially_paid',
    'rejected', 'expired', 'cancelled'
  )),
  payment_status text not null default 'unpaid' check (payment_status in (
    'unpaid', 'pending', 'paid', 'failed', 'refunded'
  )),
  fulfillment_status text not null default 'new' check (fulfillment_status in (
    'new', 'preparing', 'ready', 'delivered', 'cancelled'
  )),
  payment_link text,
  qr_payload text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pagos
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  provider text not null default 'mock',
  provider_reference text,
  amount numeric(14, 2) not null,
  currency text not null default 'VES',
  status text not null check (status in ('pending', 'succeeded', 'failed', 'reversed')),
  method text not null default 'mock',
  payer_name text,
  payer_phone text,
  bank_reference text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Conciliación
create table if not exists public.reconciliation_matches (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  payment_id uuid not null references public.payments(id) on delete cascade,
  match_status text not null default 'matched' check (match_status in (
    'matched', 'suggested', 'manual_review', 'unmatched'
  )),
  confidence_score int not null default 100 check (confidence_score >= 0 and confidence_score <= 100),
  matched_by text not null default 'system' check (matched_by in ('system', 'user')),
  notes text,
  created_at timestamptz not null default now()
);

-- Cierre de caja
create table if not exists public.cash_closures (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  closure_date date not null,
  total_orders int not null default 0,
  total_amount numeric(14, 2) not null default 0,
  total_paid numeric(14, 2) not null default 0,
  total_pending numeric(14, 2) not null default 0,
  total_failed numeric(14, 2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'reviewed')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (merchant_id, branch_id, closure_date)
);

-- Secuencia para public_code CP-XXXX
create sequence if not exists public.order_code_seq start 1000;

create or replace function public.generate_public_code()
returns text
language plpgsql
as $$
declare
  n bigint;
begin
  n := nextval('public.order_code_seq');
  return 'CP-' || n::text;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger merchants_updated_at before update on public.merchants
  for each row execute function public.set_updated_at();
create trigger branches_updated_at before update on public.branches
  for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger customers_updated_at before update on public.customers
  for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create trigger payments_updated_at before update on public.payments
  for each row execute function public.set_updated_at();
create trigger cash_closures_updated_at before update on public.cash_closures
  for each row execute function public.set_updated_at();

create index if not exists idx_orders_merchant on public.orders(merchant_id);
create index if not exists idx_orders_seller on public.orders(seller_id);
create index if not exists idx_orders_public_code on public.orders(public_code);
create index if not exists idx_payments_merchant on public.payments(merchant_id);
create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_customers_merchant on public.customers(merchant_id);
