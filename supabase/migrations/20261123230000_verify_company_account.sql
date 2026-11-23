-- admitted_at = cuenta verificada (diagnóstico). Ya no limita origen path ni cupo RSVP.
create or replace function public.approve_external_signup(company_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  already timestamptz;
begin
  if auth.uid() is null then
    raise exception 'sin sesión';
  end if;
  if not (select private.is_superadmin()) then
    raise exception 'solo el superadmin verifica cuentas';
  end if;
  select admitted_at into already
  from public.companies
  where id = company_id;
  if not found then
    raise exception 'empresa no encontrada';
  end if;
  if already is not null then
    raise exception 'ya está verificada';
  end if;
  update public.companies
  set admitted_at = clock_timestamp(),
      admitted_by = auth.uid()
  where id = company_id;
end;
$$;

create or replace function public.claim_session_seat(p_session_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  mail text;
  firm uuid;
  sector uuid;
  slug text;
  open_session boolean;
  rsvp uuid;
begin
  if uid is null then raise exception 'sin sesión'; end if;

  select p.email into mail from public.profiles p where p.id = uid and p.role = 'empresario';
  if mail is null then raise exception 'sin_empresa'; end if;
  mail := lower(mail);

  select c.id, c.sector_id into firm, sector
  from public.companies c where c.profile_id = uid limit 1;
  if firm is null then raise exception 'sin_empresa'; end if;

  select s.is_current into open_session from public.sessions s where s.id = p_session_id;
  if open_session is distinct from true then raise exception 'sesion_cerrada'; end if;

  select s.slug into slug from public.sectors s where s.id = sector;

  select id into rsvp from public.session_rsvps
  where session_id = p_session_id and email = mail;
  if rsvp is not null then
    if (select status from public.session_rsvps where id = rsvp) = 'confirmed' then
      return rsvp;
    end if;
  end if;

  if private.session_is_full(p_session_id, sector) then
    raise exception 'cupo_lleno';
  end if;

  insert into public.session_rsvps (
    session_id, email, status, sector_id, sector_slug, profile_id, company_id, source, confirmed_at
  ) values (
    p_session_id, mail, 'confirmed', sector, slug, uid, firm, 'app', clock_timestamp()
  )
  on conflict (session_id, email) do update set
    status = 'confirmed',
    confirmed_at = coalesce(public.session_rsvps.confirmed_at, clock_timestamp()),
    cancelled_at = null,
    profile_id = uid,
    company_id = firm,
    sector_id = coalesce(excluded.sector_id, public.session_rsvps.sector_id),
    updated_at = clock_timestamp()
  returning id into rsvp;

  return rsvp;
end;
$$;