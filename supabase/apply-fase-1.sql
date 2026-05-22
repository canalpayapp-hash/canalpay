-- CanalPay MVP â€” schema inicial

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

-- Ã“rdenes de cobro
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

-- ConciliaciÃ³n
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
-- RLS, helpers y RPC pÃºblico / simulaciÃ³n de pago

alter table public.merchants enable row level security;
alter table public.branches enable row level security;
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.reconciliation_matches enable row level security;
alter table public.cash_closures enable row level security;

create or replace function public.current_user_merchant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select merchant_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin' and status = 'active'
  );
$$;

create or replace function public.is_merchant_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'active'
      and role in ('merchant_admin', 'supervisor', 'seller', 'cashier')
  );
$$;

-- Perfiles
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_super_admin()
    or (
      merchant_id = public.current_user_merchant_id()
      and public.current_user_role() in ('merchant_admin', 'supervisor')
    )
  );

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_manage" on public.profiles
  for all to authenticated
  using (
    public.is_super_admin()
    or (
      merchant_id = public.current_user_merchant_id()
      and public.current_user_role() = 'merchant_admin'
    )
  )
  with check (
    public.is_super_admin()
    or (
      merchant_id = public.current_user_merchant_id()
      and public.current_user_role() = 'merchant_admin'
    )
  );

-- Merchants
create policy "merchants_select" on public.merchants
  for select to authenticated
  using (
    public.is_super_admin()
    or id = public.current_user_merchant_id()
  );

create policy "merchants_super_admin_all" on public.merchants
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- Branches
create policy "branches_select" on public.branches
  for select to authenticated
  using (
    public.is_super_admin()
    or merchant_id = public.current_user_merchant_id()
  );

create policy "branches_admin_manage" on public.branches
  for all to authenticated
  using (
    public.is_super_admin()
    or (
      merchant_id = public.current_user_merchant_id()
      and public.current_user_role() = 'merchant_admin'
    )
  )
  with check (
    public.is_super_admin()
    or (
      merchant_id = public.current_user_merchant_id()
      and public.current_user_role() = 'merchant_admin'
    )
  );

-- Customers
create policy "customers_select" on public.customers
  for select to authenticated
  using (
    public.is_super_admin()
    or merchant_id = public.current_user_merchant_id()
  );

create policy "customers_insert" on public.customers
  for insert to authenticated
  with check (
    public.is_super_admin()
    or (
      merchant_id = public.current_user_merchant_id()
      and public.current_user_role() in ('merchant_admin', 'seller', 'cashier')
    )
  );

create policy "customers_update" on public.customers
  for update to authenticated
  using (
    public.is_super_admin()
    or (
      merchant_id = public.current_user_merchant_id()
      and public.current_user_role() in ('merchant_admin', 'supervisor')
    )
  );

-- Orders
create policy "orders_select" on public.orders
  for select to authenticated
  using (
    public.is_super_admin()
    or (
      merchant_id = public.current_user_merchant_id()
      and public.current_user_role() in ('merchant_admin', 'supervisor')
    )
    or (
      merchant_id = public.current_user_merchant_id()
      and seller_id = auth.uid()
      and public.current_user_role() in ('seller', 'cashier')
    )
  );

create policy "orders_insert" on public.orders
  for insert to authenticated
  with check (
    public.is_super_admin()
    or (
      merchant_id = public.current_user_merchant_id()
      and seller_id = auth.uid()
      and public.current_user_role() in ('seller', 'cashier', 'merchant_admin')
    )
  );

create policy "orders_update" on public.orders
  for update to authenticated
  using (
    public.is_super_admin()
    or (
      merchant_id = public.current_user_merchant_id()
      and public.current_user_role() in ('merchant_admin', 'supervisor')
    )
    or (
      merchant_id = public.current_user_merchant_id()
      and seller_id = auth.uid()
      and public.current_user_role() in ('seller', 'cashier')
      and payment_status not in ('paid', 'refunded')
    )
  );

-- Payments
create policy "payments_select" on public.payments
  for select to authenticated
  using (
    public.is_super_admin()
    or merchant_id = public.current_user_merchant_id()
  );

create policy "payments_insert_staff" on public.payments
  for insert to authenticated
  with check (
    public.is_super_admin()
    or merchant_id = public.current_user_merchant_id()
  );

-- Reconciliation
create policy "reconciliation_select" on public.reconciliation_matches
  for select to authenticated
  using (
    public.is_super_admin()
    or merchant_id = public.current_user_merchant_id()
  );

create policy "reconciliation_insert" on public.reconciliation_matches
  for insert to authenticated
  with check (
    public.is_super_admin()
    or merchant_id = public.current_user_merchant_id()
  );

-- Cash closures
create policy "cash_closures_select" on public.cash_closures
  for select to authenticated
  using (
    public.is_super_admin()
    or merchant_id = public.current_user_merchant_id()
  );

create policy "cash_closures_manage" on public.cash_closures
  for all to authenticated
  using (
    public.is_super_admin()
    or (
      merchant_id = public.current_user_merchant_id()
      and public.current_user_role() in ('merchant_admin', 'cashier')
    )
  )
  with check (
    public.is_super_admin()
    or (
      merchant_id = public.current_user_merchant_id()
      and public.current_user_role() in ('merchant_admin', 'cashier')
    )
  );

-- RPC: orden pÃºblica para pÃ¡gina de pago (sin auth)
create or replace function public.get_order_for_payment(p_public_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'public_code', o.public_code,
    'concept', o.concept,
    'amount', o.amount,
    'currency', o.currency,
    'channel', o.channel,
    'status', o.status,
    'payment_status', o.payment_status,
    'merchant_name', m.name,
    'merchant_logo_url', m.logo_url,
    'can_pay', (o.status not in ('paid', 'cancelled') and o.payment_status not in ('paid', 'refunded'))
  )
  into result
  from public.orders o
  join public.merchants m on m.id = o.merchant_id
  where o.public_code = p_public_code;

  return result;
end;
$$;

grant execute on function public.get_order_for_payment(text) to anon, authenticated;

-- RPC: simular pago desde link pÃºblico
create or replace function public.simulate_order_payment(
  p_public_code text,
  p_outcome text,
  p_method text default 'mock'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_payment_id uuid;
  v_provider_ref text;
begin
  if p_outcome not in ('succeeded', 'pending', 'failed') then
    raise exception 'Invalid outcome: %', p_outcome;
  end if;

  select * into v_order from public.orders where public_code = p_public_code for update;
  if not found then
    raise exception 'Order not found';
  end if;

  if v_order.status = 'cancelled' or v_order.payment_status = 'paid' then
    raise exception 'Order cannot be paid';
  end if;

  v_provider_ref := 'MOCK-' || upper(substr(md5(random()::text), 1, 12));

  insert into public.payments (
    merchant_id, order_id, provider, provider_reference,
    amount, currency, status, method, raw_payload
  ) values (
    v_order.merchant_id,
    v_order.id,
    'mock',
    v_provider_ref,
    v_order.amount,
    v_order.currency,
    case p_outcome
      when 'succeeded' then 'succeeded'
      when 'pending' then 'pending'
      else 'failed'
    end,
    coalesce(p_method, 'mock'),
    jsonb_build_object('simulated', true, 'outcome', p_outcome)
  )
  returning id into v_payment_id;

  if p_outcome = 'succeeded' then
    update public.orders set
      status = 'paid',
      payment_status = 'paid',
      updated_at = now()
    where id = v_order.id;

    insert into public.reconciliation_matches (
      merchant_id, order_id, payment_id,
      match_status, confidence_score, matched_by
    ) values (
      v_order.merchant_id, v_order.id, v_payment_id,
      'matched', 100, 'system'
    );
  elsif p_outcome = 'pending' then
    update public.orders set
      status = 'pending_payment',
      payment_status = 'pending',
      updated_at = now()
    where id = v_order.id;
  else
    update public.orders set
      payment_status = 'failed',
      updated_at = now()
    where id = v_order.id;
  end if;

  return jsonb_build_object(
    'payment_id', v_payment_id,
    'provider_reference', v_provider_ref,
    'outcome', p_outcome
  );
end;
$$;

grant execute on function public.simulate_order_payment(text, text, text) to anon, authenticated;
-- Permisos para app mÃ³vil / RPC internos (Fase 1)

grant usage on schema public to anon, authenticated;
grant usage, select on sequence public.order_code_seq to authenticated;

grant execute on function public.generate_public_code() to authenticated;
