-- Cancelación por sesión: libera cupo (confirmed → cancelled) sin tocar otras sesiones.
alter table public.session_rsvps
  add column if not exists cancel_reason text
  check (cancel_reason is null or char_length(cancel_reason) between 1 and 280);

create or replace function public.cancel_session_rsvp(p_session_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  mail text;
  text_reason text := btrim(coalesce(p_reason, ''));
  row public.session_rsvps%rowtype;
begin
  if uid is null then
    raise exception 'sin sesión';
  end if;
  if char_length(text_reason) < 1 or char_length(text_reason) > 280 then
    raise exception 'motivo';
  end if;
  select lower(p.email) into mail
  from public.profiles as p
  where p.id = uid and p.role = 'empresario';
  if mail is null then
    raise exception 'sin_empresa';
  end if;

  select * into row
  from public.session_rsvps as r
  where r.session_id = p_session_id
    and (r.email = mail or r.profile_id = uid)
  for update;

  if row.id is null then
    raise exception 'todavia_no_ocupa';
  end if;
  if row.status = 'cancelled' then
    raise exception 'ya_cancelo';
  end if;
  if row.status <> 'confirmed' then
    raise exception 'todavia_no_ocupa';
  end if;

  update public.session_rsvps
  set status = 'cancelled',
      cancelled_at = clock_timestamp(),
      cancel_reason = text_reason,
      updated_at = clock_timestamp()
  where id = row.id;
end;
$$;

revoke all on function public.cancel_session_rsvp(uuid, text) from public;
grant execute on function public.cancel_session_rsvp(uuid, text) to authenticated;

-- Mesa: resolver pase QR anclado al RSVP (sin cuenta).
create or replace function public.mesa_rsvp_guest(p_rsvp_id uuid)
returns table (
  full_name text,
  company_name text,
  sector_name text,
  invited_by text,
  profile_id uuid
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce(nullif(btrim(r.full_name), ''), nullif(btrim(r.email), '')),
    nullif(btrim(r.company_name), ''),
    coalesce(sector.name, nullif(btrim(r.sector_slug), '')),
    ''::text,
    r.profile_id
  from public.session_rsvps as r
  left join public.sectors as sector on sector.id = r.sector_id
  where r.id = p_rsvp_id
    and r.status = 'confirmed'
    and (select private.current_role()) in (
      'superadmin'::public.account_role,
      'moderador'::public.account_role
    );
$$;

revoke all on function public.mesa_rsvp_guest(uuid) from public, anon;
grant execute on function public.mesa_rsvp_guest(uuid) to authenticated;

create or replace function public.my_attendance_state()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  cid uuid;
  sid uuid;
  sess uuid;
  mail text;
  rsvp_status text;
begin
  if auth.uid() is null then
    return 'sin_empresa';
  end if;
  select lower(p.email) into mail from public.profiles as p where p.id = auth.uid();
  select id, sector_id, session_id into cid, sid, sess
  from public.companies
  where profile_id = auth.uid()
  limit 1;
  if cid is null then
    return 'sin_empresa';
  end if;
  if sess is not null and mail is not null then
    select r.status into rsvp_status
    from public.session_rsvps as r
    where r.session_id = sess and r.email = mail
    limit 1;
    if rsvp_status = 'cancelled' then
      return 'cancelo';
    end if;
    if rsvp_status = 'confirmed' then
      return 'ocupa';
    end if;
  end if;
  if exists (select 1 from public.attendance_cancellations x where x.company_id = cid) then
    return 'cancelo';
  end if;
  if exists (
    select 1 from private.sector_occupied_ids(sid) as occupied(company_id)
    where occupied.company_id = cid
  ) then
    return 'ocupa';
  end if;
  return 'espera';
end;
$$;

revoke all on function public.my_attendance_state() from public;
grant execute on function public.my_attendance_state() to authenticated;

notify pgrst, 'reload schema';