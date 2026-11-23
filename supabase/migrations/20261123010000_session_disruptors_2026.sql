insert into public.sessions (
  title,
  public_slug,
  session_on,
  venue,
  format_name,
  starts_local,
  ends_local,
  time_zone,
  capacity_min,
  capacity_max,
  audience,
  includes,
  is_current
)
values (
  'DISRUPTORS 2026',
  '28-11-26-disruptors-2026',
  date '2026-11-28',
  'Auditorio Domenico Zipoli, Instituto Oriente, Puebla',
  'Experiencia presencial',
  time '08:30',
  time '18:00',
  'America/Mexico_City',
  50,
  1214,
  'Empresarios, líderes, organismos y tomadores de decisión invitados por el Clúster',
  'Acceso cortesía del Clúster de Startups e Innovación',
  false
)
on conflict (public_slug) do update
set
  title = excluded.title,
  session_on = excluded.session_on,
  venue = excluded.venue,
  format_name = excluded.format_name,
  starts_local = excluded.starts_local,
  ends_local = excluded.ends_local,
  capacity_min = excluded.capacity_min,
  capacity_max = excluded.capacity_max,
  audience = excluded.audience,
  includes = excluded.includes;
