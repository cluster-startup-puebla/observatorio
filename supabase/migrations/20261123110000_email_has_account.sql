create or replace function public.email_has_account(target text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profiles
    where lower(profiles.email) = lower(btrim(target))
  )
  or exists (
    select 1
    from auth.users as users
    where lower(users.email) = lower(btrim(target))
  );
$$;

revoke all on function public.email_has_account(text) from public;
grant execute on function public.email_has_account(text) to anon, authenticated, service_role;

notify pgrst, 'reload schema';