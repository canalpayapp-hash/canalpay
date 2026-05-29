-- Registro móvil: el usuario autenticado crea su perfil vendedor (sin comercio hasta que admin asigne)

create or replace function public.complete_mobile_registration(
  p_full_name text,
  p_phone text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'No autenticado';
  end if;

  if trim(p_full_name) = '' then
    raise exception 'El nombre es obligatorio';
  end if;

  insert into public.profiles (id, full_name, phone, role, status, merchant_id, branch_id)
  values (auth.uid(), trim(p_full_name), nullif(trim(p_phone), ''), 'seller', 'active', null, null)
  on conflict (id) do update
    set full_name = excluded.full_name,
        phone = excluded.phone,
        updated_at = now();
end;
$$;

grant execute on function public.complete_mobile_registration(text, text) to authenticated;
