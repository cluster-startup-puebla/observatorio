drop function if exists public.accept_public_registration(uuid, text, uuid);

create or replace function public.accept_public_registration(
  registration_id uuid,
  account_password text,
  org_id uuid
)
returns table (guest_id uuid, guest_email text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  guest uuid;
  sector uuid;
  clean_org uuid := org_id;
  row public.public_registrations%rowtype;
  band public.employee_band;
  contact uuid;
  latest text;
begin
  if auth.uid() is null or not (select private.is_superadmin()) then
    raise exception 'sin sesión';
  end if;

  select * into row
  from public.public_registrations as registration
  where registration.id = accept_public_registration.registration_id
  for update;

  if row.id is null then
    raise exception 'no está';
  end if;
  if row.poured_profile_id is not null then
    guest_id := row.poured_profile_id;
    guest_email := row.email;
    return next;
    return;
  end if;
  if row.completed_at is null then
    raise exception 'incompleto';
  end if;

  select sectors.id into sector from public.sectors as sectors where sectors.slug = row.sector_slug;
  if sector is null then
    raise exception 'sector';
  end if;
  band := case row.employee_band
    when '1' || chr(8211) || '10' then '1_10'::public.employee_band
    when '11' || chr(8211) || '50' then '11_50'::public.employee_band
    when '51' || chr(8211) || '250' then '51_250'::public.employee_band
    when '250+' then '250_plus'::public.employee_band
    else null
  end;
  if band is null then
    raise exception 'empleados';
  end if;
  if row.market_size is not null and row.market_size not in ('local', 'regional', 'nacional', 'exportacion') then
    raise exception 'mercado';
  end if;
  if private.sector_is_full(sector) then
    raise exception 'sector_lleno';
  end if;

  if clean_org is not null and not exists (
    select 1 from public.organizations as organizations
    where organizations.id = clean_org and organizations.brand_completed_at is not null
  ) then
    clean_org := null;
  end if;

  select users.id into guest from auth.users as users where lower(users.email) = row.email;
  if guest is null then
    if char_length(account_password) < 8 then
      raise exception 'password_short';
    end if;
    guest := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token, is_sso_user, is_anonymous
    ) values (
      '00000000-0000-0000-0000-000000000000',
      guest, 'authenticated', 'authenticated', row.email,
      extensions.crypt(account_password, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(), now(), '', '', '', '', false, false
    );
    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), guest,
      jsonb_build_object('sub', guest::text, 'email', row.email),
      'email', row.email, now(), now(), now()
    );
  end if;

  if exists (select 1 from public.companies as company where company.profile_id = guest) then
    raise exception 'ya tiene cuenta';
  end if;

  update public.profiles as person
  set full_name = row.full_name,
      job_title = row.job_title,
      whatsapp = row.whatsapp,
      onboarded_at = coalesce(person.onboarded_at, clock_timestamp()),
      confidentiality_accepted_at = coalesce(person.confidentiality_accepted_at, clock_timestamp())
  where person.id = guest and person.role = 'empresario';
  if not found then
    raise exception 'perfil';
  end if;

  insert into public.privacy_consents (profile_id, notice, notice_version)
  values
    (guest, 'aviso-de-privacidad', '2026-10-15'),
    (guest, 'uso-de-datos', '2026-10-15')
  on conflict (profile_id, notice, notice_version) do nothing;

  insert into public.companies (
    profile_id, legal_name, sector_id, sector_source, employee_band,
    referral_source, market_size, municipality, session_interest,
    show_logo_on_event, admitted_at, admitted_by
  ) values (
    guest, row.company_name, sector,
    case when clean_org is null then 'path'::public.sector_source else 'link'::public.sector_source end,
    band, row.referral_source, row.market_size,
    nullif(row.municipality, ''), row.session_interest, false,
    case when clean_org is null then clock_timestamp() else null end,
    case when clean_org is null then auth.uid() else null end
  );

  if clean_org is not null then
    select contacts.id into contact
    from public.crm_contacts as contacts
    where contacts.organization_id = clean_org and contacts.email = row.email;
    if contact is null then
      insert into public.crm_contacts (organization_id, sector_id, nombre, empresa, email, source, profile_id)
      values (clean_org, sector, left(row.full_name, 120), left(row.company_name, 160), row.email, 'enlace', guest)
      returning id into contact;
      insert into public.crm_events (contact_id, event, actor_id, occurred_at)
      values (contact, 'cargar', auth.uid(), clock_timestamp());
    end if;
    select case events.event
      when 'cargar' then 'cargado'
      when 'contactar' then 'contactado'
      when 'confirmar' then 'confirmo'
      when 'registrar' then 'registrado'
      when 'llegar' then 'llego'
      else 'no'
    end into latest
    from public.crm_events as events
    where events.contact_id = contact
    order by events.occurred_at desc, events.id desc
    limit 1;
    if latest = 'cargado' or latest = 'contactado' then
      insert into public.crm_events (contact_id, event, actor_id, occurred_at)
      values (contact, 'confirmar', auth.uid(), clock_timestamp());
      insert into public.crm_events (contact_id, event, actor_id, occurred_at)
      values (contact, 'registrar', auth.uid(), clock_timestamp() + interval '1 millisecond');
    end if;
  end if;

  update public.public_registrations as registration
  set poured_at = clock_timestamp(), poured_profile_id = guest
  where registration.id = row.id and registration.poured_at is null;

  guest_id := guest;
  guest_email := row.email;
  return next;
end;
$$;

revoke all on function public.accept_public_registration(uuid, text, uuid) from public, anon;
grant execute on function public.accept_public_registration(uuid, text, uuid) to authenticated;

notify pgrst, 'reload schema';
