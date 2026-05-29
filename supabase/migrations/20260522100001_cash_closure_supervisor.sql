-- Supervisor puede gestionar cierres de caja del comercio
drop policy if exists "cash_closures_manage" on public.cash_closures;

create policy "cash_closures_manage" on public.cash_closures
  for all to authenticated
  using (
    public.is_super_admin()
    or (
      merchant_id = public.current_user_merchant_id()
      and public.current_user_role() in ('merchant_admin', 'supervisor', 'cashier')
    )
  )
  with check (
    public.is_super_admin()
    or (
      merchant_id = public.current_user_merchant_id()
      and public.current_user_role() in ('merchant_admin', 'supervisor', 'cashier')
    )
  );
