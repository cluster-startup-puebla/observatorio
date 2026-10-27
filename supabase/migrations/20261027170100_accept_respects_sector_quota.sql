create or replace function public.approve_link_signup(contact_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  org uuid;
  src text;
  current_status text;
  sid uuid;
begin
  if auth.uid() is null then
    raise exception 'sin sesión';
  end if;
  select organization_id, source, sector_id into org, src, sid
  from public.crm_contacts
  where id = contact_id;
  if org is null or src is distinct from 'enlace' then
    raise exception 'no es un registro por enlace';
  end if;
  if not (
    (select private.is_superadmin())
    or (
      org = (select private.current_organization_id())
      and (select private.current_role()) in ('director', 'capturista')
    )
  ) then
    raise exception 'no puedes aceptar esta invitación';
  end if;
  select status into current_status
  from public.crm_contact_status
  where crm_contact_status.contact_id = approve_link_signup.contact_id;
  if current_status is distinct from 'cargado' then
    raise exception 'ya no está pendiente';
  end if;
  if sid is not null and private.sector_is_full(sid) then
    raise exception 'sector_lleno';
  end if;
  insert into public.crm_events (contact_id, event, actor_id, occurred_at)
  values (contact_id, 'confirmar', auth.uid(), clock_timestamp());
  insert into public.crm_events (contact_id, event, actor_id, occurred_at)
  values (contact_id, 'registrar', auth.uid(), clock_timestamp() + interval '1 millisecond');
end;
$$;

create or replace function public.approve_external_signup(company_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  src text;
  already timestamptz;
  sid uuid;
begin
  if auth.uid() is null then
    raise exception 'sin sesión';
  end if;
  if not (select private.is_superadmin()) then
    raise exception 'solo el superadmin acepta un registro externo';
  end if;
  select sector_source, admitted_at, sector_id into src, already, sid
  from public.companies
  where id = company_id;
  if src is distinct from 'path' then
    raise exception 'no llegó por un lugar desconocido';
  end if;
  if already is not null then
    raise exception 'ya está aceptada';
  end if;
  if sid is not null and private.sector_is_full(sid) then
    raise exception 'sector_lleno';
  end if;
  update public.companies
  set admitted_at = clock_timestamp(),
      admitted_by = auth.uid()
  where id = company_id;
end;
$$;

revoke all on function public.approve_link_signup(uuid) from public;
grant execute on function public.approve_link_signup(uuid) to authenticated;
revoke all on function public.approve_external_signup(uuid) from public;
grant execute on function public.approve_external_signup(uuid) to authenticated;
revoke update (admitted_at, admitted_by) on public.companies from authenticated, anon;
