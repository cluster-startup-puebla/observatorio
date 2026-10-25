revoke all on function public.create_staff_account(text, text, public.account_role, uuid) from public, anon, authenticated, service_role;
grant execute on function public.create_staff_account(text, text, public.account_role, uuid) to authenticated;
