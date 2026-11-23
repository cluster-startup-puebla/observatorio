-- Dual-write: public_registrations → session_rsvps (pending).
create or replace function public.sync_public_registration_rsvp(p_registration_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  row public.public_registrations%rowtype;
  sector uuid;
  rsvp uuid;
begin
  select * into row from public.public_registrations where id = p_registration_id;
  if row.id is null then raise exception 'no está'; end if;
  if row.session_id is null then raise exception 'sesion'; end if;
  if row.completed_at is null then raise exception 'incompleto'; end if;

  select s.id into sector from public.sectors s where s.slug = row.sector_slug;

  insert into public.session_rsvps (
    session_id, email, status, sector_id, sector_slug, full_name, company_name,
    invite_token, profile_id, source
  ) values (
    row.session_id, row.email, 'pending', sector, row.sector_slug, row.full_name, row.company_name,
    row.invite_token, row.poured_profile_id, 'public'
  )
  on conflict (session_id, email) do update set
    sector_id = coalesce(excluded.sector_id, public.session_rsvps.sector_id),
    sector_slug = coalesce(excluded.sector_slug, public.session_rsvps.sector_slug),
    full_name = coalesce(excluded.full_name, public.session_rsvps.full_name),
    company_name = coalesce(excluded.company_name, public.session_rsvps.company_name),
    invite_token = coalesce(excluded.invite_token, public.session_rsvps.invite_token),
    updated_at = clock_timestamp()
  returning id into rsvp;
  return rsvp;
end;
$$;

revoke all on function public.sync_public_registration_rsvp(uuid) from public;
grant execute on function public.sync_public_registration_rsvp(uuid) to anon, authenticated;

-- Admin confirma lugar: cupo + confirmed. No crea auth/password.
create or replace function public.confirm_registration_rsvp(p_registration_id uuid)
returns table (rsvp_id uuid, to_email text, session_id uuid, already_confirmed boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  row public.public_registrations%rowtype;
  rsvp public.session_rsvps%rowtype;
  person uuid;
  firm uuid;
begin
  if auth.uid() is null or not (select private.is_superadmin()) then
    raise exception 'sin sesión';
  end if;
  select * into row from public.public_registrations where id = p_registration_id;
  if row.id is null then raise exception 'no está'; end if;
  if row.completed_at is null then raise exception 'incompleto'; end if;
  if row.session_id is null then raise exception 'sesion'; end if;

  perform public.sync_public_registration_rsvp(p_registration_id);
  select * into rsvp from public.session_rsvps
  where session_rsvps.session_id = row.session_id and session_rsvps.email = row.email;

  if rsvp.status = 'confirmed' then
    rsvp_id := rsvp.id;
    to_email := rsvp.email;
    session_id := rsvp.session_id;
    already_confirmed := true;
    return next;
    return;
  end if;

  if private.session_is_full(rsvp.session_id, rsvp.sector_id) then
    raise exception 'sector_lleno';
  end if;

  select p.id into person from public.profiles p where lower(p.email) = row.email limit 1;
  if person is not null then
    select c.id into firm from public.companies c where c.profile_id = person limit 1;
  end if;

  update public.session_rsvps
  set status = 'confirmed',
      confirmed_at = clock_timestamp(),
      profile_id = coalesce(session_rsvps.profile_id, person),
      company_id = coalesce(session_rsvps.company_id, firm),
      updated_at = clock_timestamp()
  where id = rsvp.id
  returning * into rsvp;

  rsvp_id := rsvp.id;
  to_email := rsvp.email;
  session_id := rsvp.session_id;
  already_confirmed := false;
  return next;
end;
$$;

revoke all on function public.confirm_registration_rsvp(uuid) from public;
grant execute on function public.confirm_registration_rsvp(uuid) to authenticated;
