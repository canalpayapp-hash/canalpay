-- Seed demo Dulce Caracas
-- Ejecutar DESPUÉS de crear usuarios en Auth (ver README)

do $$
declare
  v_merchant_id uuid;
  v_branch_id uuid;
  v_admin_id uuid;
  v_seller_id uuid;
  v_cashier_id uuid;
  v_c1 uuid;
  v_c2 uuid;
  v_c3 uuid;
begin
  select id into v_merchant_id from public.merchants where name = 'Dulce Caracas' limit 1;
  if v_merchant_id is null then
    insert into public.merchants (name, rif, phone, email, address, status)
    values (
      'Dulce Caracas',
      'J-12345678-9',
      '+584121234567',
      'contacto@dulcecaracas.demo',
      'Av. Principal, Caracas',
      'active'
    )
    returning id into v_merchant_id;
  end if;

  select id into v_branch_id from public.branches
  where merchant_id = v_merchant_id and name = 'Chacao' limit 1;
  if v_branch_id is null then
    insert into public.branches (merchant_id, name, address, phone, status)
    values (v_merchant_id, 'Chacao', 'Av. Francisco de Miranda, Chacao', '+584121111111', 'active')
    returning id into v_branch_id;
  end if;

  -- Perfiles (requiere usuarios Auth creados)
  select id into v_admin_id from auth.users where email = 'admin@dulcecaracas.com' limit 1;
  select id into v_seller_id from auth.users where email = 'vendedor@dulcecaracas.com' limit 1;
  select id into v_cashier_id from auth.users where email = 'cajero@dulcecaracas.com' limit 1;

  if v_admin_id is not null then
    insert into public.profiles (id, merchant_id, branch_id, full_name, role, status)
    values (v_admin_id, v_merchant_id, v_branch_id, 'Admin Demo', 'merchant_admin', 'active')
    on conflict (id) do update set
      merchant_id = excluded.merchant_id,
      branch_id = excluded.branch_id,
      full_name = excluded.full_name,
      role = excluded.role,
      status = excluded.status;
  end if;

  if v_seller_id is not null then
    insert into public.profiles (id, merchant_id, branch_id, full_name, role, status)
    values (v_seller_id, v_merchant_id, v_branch_id, 'Vendedor Demo', 'seller', 'active')
    on conflict (id) do update set
      merchant_id = excluded.merchant_id,
      branch_id = excluded.branch_id,
      full_name = excluded.full_name,
      role = excluded.role,
      status = excluded.status;
  end if;

  if v_cashier_id is not null then
    insert into public.profiles (id, merchant_id, branch_id, full_name, role, status)
    values (v_cashier_id, v_merchant_id, v_branch_id, 'Cajero Demo', 'cashier', 'active')
    on conflict (id) do update set
      merchant_id = excluded.merchant_id,
      branch_id = excluded.branch_id,
      full_name = excluded.full_name,
      role = excluded.role,
      status = excluded.status;
  end if;

  -- Clientes
  if not exists (select 1 from public.customers where merchant_id = v_merchant_id and name = 'Andrea Pérez') then
    insert into public.customers (merchant_id, name, phone, channel_default)
    values (v_merchant_id, 'Andrea Pérez', '+584241112233', 'whatsapp')
    returning id into v_c1;
  else
    select id into v_c1 from public.customers where merchant_id = v_merchant_id and name = 'Andrea Pérez' limit 1;
  end if;

  if not exists (select 1 from public.customers where merchant_id = v_merchant_id and name = 'Carlos Rodríguez') then
    insert into public.customers (merchant_id, name, phone, channel_default)
    values (v_merchant_id, 'Carlos Rodríguez', '+584242223344', 'instagram')
    returning id into v_c2;
  else
    select id into v_c2 from public.customers where merchant_id = v_merchant_id and name = 'Carlos Rodríguez' limit 1;
  end if;

  if not exists (select 1 from public.customers where merchant_id = v_merchant_id and name = 'María González') then
    insert into public.customers (merchant_id, name, phone, channel_default)
    values (v_merchant_id, 'María González', '+584243334455', 'delivery')
    returning id into v_c3;
  else
    select id into v_c3 from public.customers where merchant_id = v_merchant_id and name = 'María González' limit 1;
  end if;

  -- Órdenes demo (solo si no existen)
  if not exists (select 1 from public.orders where public_code = 'CP-1001') then
    insert into public.orders (
      public_code, merchant_id, branch_id, customer_id, seller_id,
      channel, concept, amount, currency, status, payment_status,
      payment_link, fulfillment_status
    ) values (
      'CP-1001', v_merchant_id, v_branch_id, v_c1, v_seller_id,
      'whatsapp', 'Torta de chocolate mediana', 45.00, 'USD',
      'paid', 'paid',
      'http://localhost:3000/pagar/CP-1001', 'delivered'
    );
  end if;

  if not exists (select 1 from public.orders where public_code = 'CP-1002') then
    insert into public.orders (
      public_code, merchant_id, branch_id, customer_id, seller_id,
      channel, concept, amount, currency, status, payment_status,
      payment_link, fulfillment_status
    ) values (
      'CP-1002', v_merchant_id, v_branch_id, v_c2, v_seller_id,
      'instagram', 'Cupcakes x12 decorados', 32.50, 'USD',
      'pending_payment', 'unpaid',
      'http://localhost:3000/pagar/CP-1002', 'new'
    );
  end if;

  if not exists (select 1 from public.orders where public_code = 'CP-1003') then
    insert into public.orders (
      public_code, merchant_id, branch_id, customer_id, seller_id,
      channel, concept, amount, currency, status, payment_status,
      payment_link, fulfillment_status
    ) values (
      'CP-1003', v_merchant_id, v_branch_id, v_c3, v_cashier_id,
      'tienda', 'Brownies caja familiar', 18.00, 'USD',
      'paid', 'paid',
      'http://localhost:3000/pagar/CP-1003', 'ready'
    );
  end if;

  if not exists (select 1 from public.orders where public_code = 'CP-1004') then
    insert into public.orders (
      public_code, merchant_id, branch_id, customer_id, seller_id,
      channel, concept, amount, currency, status, payment_status,
      payment_link, fulfillment_status
    ) values (
      'CP-1004', v_merchant_id, v_branch_id, v_c1, v_seller_id,
      'delivery', 'Pedido delivery Los Palos Grandes', 28.00, 'USD',
      'pending_payment', 'failed',
      'http://localhost:3000/pagar/CP-1004', 'cancelled'
    );
  end if;

  perform setval('public.order_code_seq', greatest(1004, (select last_value from public.order_code_seq)), true);
end $$;
