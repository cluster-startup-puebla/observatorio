-- Pace del organismo: confirmados en la sesión vigente (session_rsvps), no solo CRM legacy.
create or replace function public.sector_pace(p_sector_id uuid)
returns table (capacity integer, mine integer, others integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  org uuid;
  cap integer;
  total integer;
  own integer;
begin
  if auth.uid() is null then
    raise exception 'sin sesión';
  end if;
  if not (
    (select private.is_superadmin())
    or (select private.current_role()) in ('director', 'capturista')
  ) then
    raise exception 'forbidden';
  end if;

  org := private.current_organization_id();

  select coalesce(sum(q.capacity), null)::integer into cap
  from public.session_sector_quotas q
  join public.sessions s on s.id = q.session_id
  where s.is_current and q.sector_id = p_sector_id;

  select count(*)::integer into total
  from public.session_rsvps r
  join public.sessions s on s.id = r.session_id
  where s.is_current
    and r.sector_id = p_sector_id
    and r.status = 'confirmed';

  select count(*)::integer into own
  from public.session_rsvps r
  join public.sessions s on s.id = r.session_id
  where s.is_current
    and r.sector_id = p_sector_id
    and r.status = 'confirmed'
    and r.organization_id = org;

  capacity := cap;
  mine := coalesce(own, 0);
  others := greatest(coalesce(total, 0) - coalesce(own, 0), 0);
  return next;
end;
$$;

revoke all on function public.sector_pace(uuid) from public;
grant execute on function public.sector_pace(uuid) to authenticated;