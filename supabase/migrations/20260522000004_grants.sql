-- Permisos para app móvil / RPC internos (Fase 1)

grant usage on schema public to anon, authenticated;
grant usage, select on sequence public.order_code_seq to authenticated;

grant execute on function public.generate_public_code() to authenticated;
