-- /app/sesiones only lists sessions with a quota for the company sector.
-- DISRUPTORS had none, so it never appeared for empresarios.
insert into public.session_sector_quotas (session_id, sector_id, capacity)
select d.id, q.sector_id, q.capacity
from public.sessions d
cross join public.sessions a
join public.session_sector_quotas q on q.session_id = a.id
where d.public_slug = '28-11-26-disruptors-2026'
  and a.public_slug = '18-11-26-arranque-puebla-x-puebla'
on conflict (session_id, sector_id) do update
set capacity = excluded.capacity;

insert into public.session_sector_quotas (session_id, sector_id, capacity)
select d.id, s.id, 50
from public.sessions d
join public.sectors s on s.slug = 'tecnologia-y-servicios-de-ti'
where d.public_slug = '28-11-26-disruptors-2026'
on conflict (session_id, sector_id) do update
set capacity = excluded.capacity;

update public.sessions s
set capacity_max = coalesce((
  select sum(q.capacity)::integer
  from public.session_sector_quotas q
  where q.session_id = s.id
), s.capacity_max)
where s.public_slug = '28-11-26-disruptors-2026';
