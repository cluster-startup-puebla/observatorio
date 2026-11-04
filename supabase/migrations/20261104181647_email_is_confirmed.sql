create or replace function public.email_is_confirmed(target text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users
    where lower(email) = lower(btrim(target))
      and email_confirmed_at is not null
  )
$$;

revoke all on function public.email_is_confirmed(text) from public;
grant execute on function public.email_is_confirmed(text) to anon, authenticated, service_role;
