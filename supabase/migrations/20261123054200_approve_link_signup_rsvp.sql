-- CRM accept advances funnel; cupo only when confirming a new RSVP.
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
  mail text;
  label text;
  firm_name text;
  person uuid;
  firm uuid;
  session_uuid uuid;
  rsvp uuid;
  rsvp_status text;
  sector_slug text;
begin
  if auth.uid() is null then
    raise exception 'sin sesión';
  end if;
  select c.organization_id, c.source, c.sector_id, c.email, c.nombre, c.empresa, c.profile_id
  into org, src, sid, mail, label, firm_name, person
  from public.crm_contacts as c
  where c.id = contact_id;
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
  select s.status into current_status
  from public.crm_contact_status as s
  where s.contact_id = approve_link_signup.contact_id;
  if current_status is distinct from 'cargado' then
    raise exception 'ya no está pendiente';
  end if;

  select r.session_id into session_uuid
  from public.session_rsvps as r
  where r.email = mail and r.organization_id = org
  order by r.updated_at desc
  limit 1;
  if session_uuid is null then
    select reg.session_id into session_uuid
    from public.public_registrations as reg
    where reg.email = mail and reg.session_id is not null
    order by reg.created_at desc
    limit 1;
  end if;
  if session_uuid is null and sid is not null then
    select lc.session_id into session_uuid
    from public.link_copies as lc
    where lc.organization_id = org and lc.sector_id = sid and lc.session_id is not null
    order by lc.created_at desc
    limit 1;
  end if;
  if session_uuid is null then
    select sessions.id into session_uuid from public.sessions as sessions
    where sessions.is_current = true
    order by sessions.created_at desc
    limit 1;
  end if;

  if session_uuid is not null then
    select r.id, r.status into rsvp, rsvp_status
    from public.session_rsvps as r
    where r.session_id = session_uuid and r.email = mail;
    if rsvp_status is distinct from 'confirmed' then
      if private.session_is_full(session_uuid, sid) then
        raise exception 'sector_lleno';
      end if;
      select sectors.slug into sector_slug from public.sectors as sectors where sectors.id = sid;
      if person is not null then
        select companies.id into firm from public.companies as companies
        where companies.profile_id = person limit 1;
      end if;
      insert into public.session_rsvps (
        session_id, email, status, sector_id, sector_slug, full_name, company_name,
        organization_id, profile_id, company_id, source, confirmed_at
      ) values (
        session_uuid, mail, 'confirmed', sid, sector_slug, label, firm_name,
        org, person, firm, 'invite', clock_timestamp()
      )
      on conflict (session_id, email) do update set
        status = 'confirmed',
        confirmed_at = coalesce(public.session_rsvps.confirmed_at, clock_timestamp()),
        cancelled_at = null,
        sector_id = coalesce(excluded.sector_id, public.session_rsvps.sector_id),
        sector_slug = coalesce(excluded.sector_slug, public.session_rsvps.sector_slug),
        organization_id = coalesce(public.session_rsvps.organization_id, excluded.organization_id),
        profile_id = coalesce(public.session_rsvps.profile_id, excluded.profile_id),
        company_id = coalesce(public.session_rsvps.company_id, excluded.company_id),
        updated_at = clock_timestamp()
      where public.session_rsvps.status is distinct from 'confirmed';
    end if;
  elsif sid is not null and private.sector_is_full(sid) then
    raise exception 'sector_lleno';
  end if;

  insert into public.crm_events (contact_id, event, actor_id, occurred_at)
  values (contact_id, 'confirmar', auth.uid(), clock_timestamp());
  insert into public.crm_events (contact_id, event, actor_id, occurred_at)
  values (contact_id, 'registrar', auth.uid(), clock_timestamp() + interval '1 millisecond');
end;
$$;

revoke all on function public.approve_link_signup(uuid) from public;
grant execute on function public.approve_link_signup(uuid) to authenticated;