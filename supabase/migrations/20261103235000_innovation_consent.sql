create table public.innovation_consents (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  token text not null unique,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint innovation_consents_token_shape check (
    char_length(token) between 43 and 80
    and token ~ '^[A-Za-z0-9_-]+$'
  )
);

comment on table public.innovation_consents is
  'Permiso para contactar a la empresa por innovación abierta. El token va en el correo. accepted_at queda vacío hasta que la persona oprime el botón. El listado del superadmin no lee el token.';

alter table public.innovation_consents enable row level security;

create policy innovation_consents_superadmin_select
  on public.innovation_consents
  for select
  to authenticated
  using ((select private.is_superadmin()));

create policy innovation_consents_superadmin_insert
  on public.innovation_consents
  for insert
  to authenticated
  with check ((select private.is_superadmin()));

revoke all on table public.innovation_consents from anon;
grant select, insert on table public.innovation_consents to authenticated;

create or replace function public.accept_open_innovation(raw_token text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  found uuid;
begin
  if raw_token is null
    or char_length(raw_token) < 43
    or char_length(raw_token) > 80
    or raw_token !~ '^[A-Za-z0-9_-]+$' then
    return 'invalido';
  end if;
  select profile_id into found
  from public.innovation_consents
  where token = raw_token;
  if found is null then
    return 'invalido';
  end if;
  update public.innovation_consents
  set accepted_at = coalesce(accepted_at, now())
  where profile_id = found;
  return 'aceptado';
end;
$$;

revoke all on function public.accept_open_innovation(text) from public;
grant execute on function public.accept_open_innovation(text) to anon, authenticated;
