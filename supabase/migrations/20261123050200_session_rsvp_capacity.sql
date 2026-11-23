-- Cupo por sesión leyendo session_rsvps.confirmed (con o sin cuenta).
create or replace function private.session_confirmed_count(
  p_session_id uuid,
  p_sector_id uuid default null
)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer
  from public.session_rsvps r
  where r.session_id = p_session_id
    and r.status = 'confirmed'
    and (p_sector_id is null or r.sector_id = p_sector_id);
$$;

create or replace function private.session_is_full(
  p_session_id uuid,
  p_sector_id uuid default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  cap integer;
  taken integer;
  has_quotas boolean;
begin
  select exists (
    select 1 from public.session_sector_quotas q where q.session_id = p_session_id
  ) into has_quotas;

  if has_quotas then
    if p_sector_id is null then
      return false;
    end if;
    select q.capacity into cap
    from public.session_sector_quotas q
    where q.session_id = p_session_id and q.sector_id = p_sector_id
    for update of q;
    if cap is null then
      return false;
    end if;
    taken := private.session_confirmed_count(p_session_id, p_sector_id);
    return taken >= cap;
  end if;

  select s.capacity_max into cap
  from public.sessions s
  where s.id = p_session_id
  for update of s;
  if cap is null or cap <= 0 then
    return false;
  end if;
  taken := private.session_confirmed_count(p_session_id, null);
  return taken >= cap;
end;
$$;

revoke all on function private.session_confirmed_count(uuid, uuid) from public, anon, authenticated;
revoke all on function private.session_is_full(uuid, uuid) from public, anon, authenticated;

-- Legacy sector_is_full: sigue existiendo; documentado como deprecated para cupo multi-sesión.
comment on function private.sector_is_full(uuid) is
  'DEPRECATED: cupo de sesión vigente. Preferir private.session_is_full(session_id, sector_id).';
