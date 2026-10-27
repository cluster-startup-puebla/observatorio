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

  select q.capacity into cap
  from public.session_sector_quotas q
  join public.sessions s on s.id = q.session_id
  where s.is_current
    and q.sector_id = p_sector_id;

  select count(*) into total from private.sector_occupied_ids(p_sector_id);

  select count(*) into own
  from private.sector_occupied_ids(p_sector_id) as occupied(company_id)
  join public.companies c on c.id = occupied.company_id
  join public.profiles p on p.id = c.profile_id
  where exists (
    select 1
    from public.crm_contacts k
    join public.crm_contact_status st on st.contact_id = k.id
    where k.organization_id = org
      and k.source = 'enlace'
      and st.status in ('confirmo', 'registrado', 'llego')
      and lower(k.email) = lower(p.email)
  );

  capacity := cap;
  mine := coalesce(own, 0);
  others := greatest(coalesce(total, 0) - coalesce(own, 0), 0);
  return next;
end;
$$;

revoke all on function public.sector_pace(uuid) from public;
grant execute on function public.sector_pace(uuid) to authenticated;
