alter table public.link_opens
  add column if not exists session_id uuid references public.sessions (id) on delete set null;

create index if not exists link_opens_session_id_idx
  on public.link_opens (session_id);

comment on column public.link_opens.session_id is
  'Sesión del enlace abierto. Nulo en aperturas viejas sin ?sesion=.';

drop function if exists public.record_link_open(uuid, text);

create or replace function public.record_link_open(
  org_id uuid,
  sector_slug text,
  p_session_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  sector uuid;
  clean_session uuid := p_session_id;
begin
  select id into sector from public.sectors where slug = sector_slug;
  if sector is null then
    return;
  end if;
  if not exists (
    select 1 from public.organizations
    where id = org_id and brand_completed_at is not null
  ) then
    return;
  end if;
  if clean_session is not null and not exists (
    select 1 from public.sessions where id = clean_session
  ) then
    clean_session := null;
  end if;
  insert into public.link_opens (organization_id, sector_id, session_id)
  values (org_id, sector, clean_session);
end;
$$;

revoke all on function public.record_link_open(uuid, text, uuid) from public;
grant execute on function public.record_link_open(uuid, text, uuid) to anon, authenticated;
