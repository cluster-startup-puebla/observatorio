insert into public.sectors (slug, name, position)
values
  ('agroindustria', 'Agroindustria', 15),
  ('gastronomia', 'Gastronomía', 16)
on conflict (slug) do nothing;

create table public.session_sector_quotas (
  session_id uuid not null references public.sessions (id) on delete cascade,
  sector_id uuid not null references public.sectors (id) on delete restrict,
  capacity integer not null check (capacity > 0),
  primary key (session_id, sector_id)
);

create index session_sector_quotas_sector_idx on public.session_sector_quotas (sector_id);

comment on table public.session_sector_quotas is
  'Invitados por sector en una sesión. Sin fila = el sector no abarca. sessions.capacity_max es la suma cuando hay filas.';

alter table public.session_sector_quotas enable row level security;
alter table public.session_sector_quotas force row level security;

grant select on public.session_sector_quotas to anon, authenticated;
grant select, insert, update, delete on public.session_sector_quotas to authenticated;

create policy session_sector_quotas_public_read on public.session_sector_quotas
  for select to anon, authenticated using (true);

create policy session_sector_quotas_superadmin_insert on public.session_sector_quotas
  for insert to authenticated with check ((select private.is_superadmin()));

create policy session_sector_quotas_superadmin_update on public.session_sector_quotas
  for update to authenticated
  using ((select private.is_superadmin()))
  with check ((select private.is_superadmin()));

create policy session_sector_quotas_superadmin_delete on public.session_sector_quotas
  for delete to authenticated using ((select private.is_superadmin()));

create or replace function public.set_session_quotas(p_session_id uuid, p_quotas jsonb)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  total integer := 0;
  min_cap integer;
begin
  if not coalesce(private.is_superadmin(), false) then
    raise exception 'forbidden';
  end if;

  select capacity_min into min_cap
  from public.sessions
  where id = p_session_id;

  if min_cap is null then
    raise exception 'sesion_no_encontrada';
  end if;

  delete from public.session_sector_quotas
  where session_id = p_session_id;

  insert into public.session_sector_quotas (session_id, sector_id, capacity)
  select
    p_session_id,
    (item.sector_id)::uuid,
    (item.capacity)::integer
  from jsonb_to_recordset(coalesce(p_quotas, '[]'::jsonb)) as item(sector_id text, capacity integer)
  where item.capacity is not null
    and item.capacity > 0
    and item.sector_id is not null;

  select coalesce(sum(capacity), 0) into total
  from public.session_sector_quotas
  where session_id = p_session_id;

  if total > 0 and total < min_cap then
    raise exception 'cupo_menor_al_minimo';
  end if;

  if total > 0 then
    update public.sessions
    set capacity_max = total
    where id = p_session_id;
  end if;

  return total;
end;
$$;

revoke all on function public.set_session_quotas(uuid, jsonb) from public, anon;
grant execute on function public.set_session_quotas(uuid, jsonb) to authenticated;
