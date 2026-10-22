create or replace function public.superadmin_exists()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where role = 'superadmin')
$$;

revoke all on function public.superadmin_exists() from public;
grant execute on function public.superadmin_exists() to anon, authenticated, service_role;

create or replace function private.confirm_until_superadmin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(740021);
  if not exists (select 1 from public.profiles where role = 'superadmin') then
    new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  end if;
  return new;
end;
$$;

drop trigger if exists confirm_until_superadmin on auth.users;
create trigger confirm_until_superadmin
  before insert on auth.users
  for each row execute function private.confirm_until_superadmin();

create or replace function private.profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role, email)
  values (new.id, 'empresario', lower(new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists profile_for_new_user on auth.users;
create trigger profile_for_new_user
  after insert on auth.users
  for each row execute function private.profile_for_new_user();

create or replace function public.claim_first_superadmin()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'sin sesion';
  end if;

  perform pg_advisory_xact_lock(740021);

  if exists (select 1 from public.profiles where role = 'superadmin') then
    raise exception 'ya existe';
  end if;

  update public.profiles
  set role = 'superadmin',
      email = lower(coalesce(auth.jwt() ->> 'email', email)),
      organization_id = null
  where id = auth.uid();

  if not found then
    insert into public.profiles (id, role, email)
    values (auth.uid(), 'superadmin', lower(auth.jwt() ->> 'email'));
  end if;
end;
$$;

revoke all on function public.claim_first_superadmin() from public;
grant execute on function public.claim_first_superadmin() to authenticated, service_role;
