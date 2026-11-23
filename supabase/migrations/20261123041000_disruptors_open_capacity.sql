-- DISRUPTORS uses a global capacity_max of 50 without per-sector distribution.
-- Empty session_sector_quotas = open session; /app/sesiones lists it for any sector.
delete from public.session_sector_quotas q
using public.sessions s
where q.session_id = s.id
  and s.public_slug = '28-11-26-disruptors-2026';

update public.sessions
set capacity_max = 50
where public_slug = '28-11-26-disruptors-2026';
