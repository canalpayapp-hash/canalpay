-- Super admin plataforma (ejecutar tras crear usuario en Auth: super@canalpay.com)

do $$
declare
  v_super_id uuid;
begin
  select id into v_super_id from auth.users where email = 'super@canalpay.com' limit 1;

  if v_super_id is not null then
    insert into public.profiles (id, merchant_id, branch_id, full_name, role, status)
    values (v_super_id, null, null, 'Super Admin CanalPay', 'super_admin', 'active')
    on conflict (id) do update set
      merchant_id = null,
      branch_id = null,
      full_name = excluded.full_name,
      role = 'super_admin',
      status = 'active';
  end if;
end $$;
