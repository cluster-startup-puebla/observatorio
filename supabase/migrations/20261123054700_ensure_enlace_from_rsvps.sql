-- Tras ligar RSVPs al perfil, crea contacto enlace en el CRM del organismo si falta.
create or replace function public.ensure_enlace_contacts_from_rsvps()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  mail text;
  r record;
  contact uuid;
  n integer := 0;
  label text;
  firm text;
begin
  if uid is null then
    raise exception 'sin sesión';
  end if;
  select lower(p.email) into mail from public.profiles p where p.id = uid;
  if mail is null then
    return 0;
  end if;

  for r in
    select distinct on (rsvp.organization_id)
      rsvp.organization_id,
      rsvp.sector_id,
      rsvp.full_name,
      rsvp.company_name
    from public.session_rsvps as rsvp
    where rsvp.email = mail
      and rsvp.organization_id is not null
    order by rsvp.organization_id, rsvp.confirmed_at desc nulls last, rsvp.updated_at desc
  loop
    if not exists (
      select 1 from public.organizations o
      where o.id = r.organization_id and o.brand_completed_at is not null
    ) then
      continue;
    end if;
    if exists (
      select 1 from public.crm_contacts k
      where k.organization_id = r.organization_id and k.email = mail
    ) then
      continue;
    end if;
    label := trim(coalesce(r.full_name, ''));
    if char_length(label) < 2 then
      label := split_part(mail, '@', 1);
    end if;
    firm := trim(coalesce(r.company_name, ''));
    if char_length(firm) < 2 then
      firm := 'Por confirmar';
    end if;
    insert into public.crm_contacts (
      organization_id, sector_id, nombre, empresa, email, source
    )
    values (
      r.organization_id,
      r.sector_id,
      left(label, 120),
      left(firm, 160),
      mail,
      'enlace'
    )
    returning id into contact;
    insert into public.crm_events (contact_id, event, actor_id, occurred_at)
    values (contact, 'cargar', uid, clock_timestamp());
    insert into public.crm_events (contact_id, event, actor_id, occurred_at)
    values (contact, 'confirmar', uid, clock_timestamp() + interval '1 millisecond');
    insert into public.crm_events (contact_id, event, actor_id, occurred_at)
    values (contact, 'registrar', uid, clock_timestamp() + interval '2 milliseconds');
    n := n + 1;
  end loop;
  return n;
end;
$$;

revoke all on function public.ensure_enlace_contacts_from_rsvps() from public;
grant execute on function public.ensure_enlace_contacts_from_rsvps() to authenticated;