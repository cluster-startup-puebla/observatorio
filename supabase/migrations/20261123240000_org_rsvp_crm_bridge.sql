-- Public registro attributed to org → CRM pending (cargado) so org can Aceptar en lista.
-- ensure_enlace only auto-confirms CRM when RSVP is already confirmed.

create or replace function public.attribute_rsvp_invite(
  p_registration_id uuid,
  p_org_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  row public.public_registrations%rowtype;
  clean_org uuid := p_org_id;
  mail text;
  label text;
  firm text;
  contact uuid;
  sector uuid;
begin
  if clean_org is null then
    return;
  end if;
  if not exists (
    select 1 from public.organizations as organizations
    where organizations.id = clean_org and organizations.brand_completed_at is not null
  ) then
    return;
  end if;
  select * into row from public.public_registrations where id = p_registration_id;
  if row.id is null or row.session_id is null then
    return;
  end if;
  perform public.sync_public_registration_rsvp(p_registration_id);
  update public.session_rsvps as rsvp
  set organization_id = clean_org,
      invite_token = coalesce(
        rsvp.invite_token,
        nullif(btrim(row.invite_token), '')
      ),
      updated_at = clock_timestamp()
  where rsvp.session_id = row.session_id and rsvp.email = row.email;

  mail := lower(row.email);
  select s.id into sector from public.sectors s where s.slug = row.sector_slug;
  if sector is null then
    select rsvp.sector_id into sector
    from public.session_rsvps as rsvp
    where rsvp.session_id = row.session_id and rsvp.email = mail;
  end if;
  if exists (
    select 1 from public.crm_contacts k
    where k.organization_id = clean_org and k.email = mail
  ) then
    return;
  end if;
  label := trim(coalesce(row.full_name, ''));
  if char_length(label) < 2 then
    label := split_part(mail, '@', 1);
  end if;
  firm := trim(coalesce(row.company_name, ''));
  if char_length(firm) < 2 then
    firm := 'Por confirmar';
  end if;
  insert into public.crm_contacts (
    organization_id, sector_id, nombre, empresa, email, source
  ) values (
    clean_org, sector, left(label, 120), left(firm, 160), mail, 'enlace'
  )
  returning id into contact;
  insert into public.crm_events (contact_id, event, actor_id, occurred_at)
  values (contact, 'cargar', null, clock_timestamp());
end;
$$;

revoke all on function public.attribute_rsvp_invite(uuid, uuid) from public;
grant execute on function public.attribute_rsvp_invite(uuid, uuid) to anon, authenticated;

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
  already_confirmed boolean;
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
      rsvp.company_name,
      rsvp.status
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
    already_confirmed := r.status = 'confirmed';
    if already_confirmed then
      insert into public.crm_events (contact_id, event, actor_id, occurred_at)
      values (contact, 'confirmar', uid, clock_timestamp() + interval '1 millisecond');
      insert into public.crm_events (contact_id, event, actor_id, occurred_at)
      values (contact, 'registrar', uid, clock_timestamp() + interval '2 milliseconds');
    end if;
    n := n + 1;
  end loop;
  return n;
end;
$$;

revoke all on function public.ensure_enlace_contacts_from_rsvps() from public;
grant execute on function public.ensure_enlace_contacts_from_rsvps() to authenticated;
