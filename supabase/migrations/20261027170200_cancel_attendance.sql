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
begin
  if auth.uid() is null then
    return 'sin_empresa';
  end if;
  select id, sector_id into cid, sid
  from public.companies
  where profile_id = auth.uid()
  limit 1;
  if cid is null then
    return 'sin_empresa';
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

create or replace function public.cancel_my_attendance(p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  cid uuid;
  sid uuid;
  text_reason text := btrim(coalesce(p_reason, ''));
begin
  if auth.uid() is null then
    raise exception 'sin sesión';
  end if;
  if char_length(text_reason) < 1 or char_length(text_reason) > 280 then
    raise exception 'motivo';
  end if;
  select id, sector_id into cid, sid
  from public.companies
  where profile_id = auth.uid()
  limit 1;
  if cid is null then
    raise exception 'todavia_no_ocupa';
  end if;
  if exists (select 1 from public.attendance_cancellations x where x.company_id = cid) then
    raise exception 'ya_cancelo';
  end if;
  if not exists (
    select 1 from private.sector_occupied_ids(sid) as occupied(company_id)
    where occupied.company_id = cid
  ) then
    raise exception 'todavia_no_ocupa';
  end if;
  insert into public.attendance_cancellations (company_id, profile_id, reason)
  values (cid, auth.uid(), text_reason);
end;
$$;

revoke all on function public.my_attendance_state() from public;
grant execute on function public.my_attendance_state() to authenticated;
revoke all on function public.cancel_my_attendance(text) from public;
grant execute on function public.cancel_my_attendance(text) to authenticated;
