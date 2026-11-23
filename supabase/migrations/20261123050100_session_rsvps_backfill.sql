-- Copia registros públicos y empresas admitidas a session_rsvps. No borra origen.
insert into public.session_rsvps (
  session_id, email, status, sector_slug, full_name, company_name,
  invite_token, profile_id, source, confirmed_at, created_at
)
select
  r.session_id,
  r.email,
  case
    when r.poured_at is not null then 'confirmed'
    when r.completed_at is not null then 'pending'
    else 'pending'
  end,
  r.sector_slug,
  r.full_name,
  r.company_name,
  r.invite_token,
  r.poured_profile_id,
  'backfill',
  case when r.poured_at is not null then r.poured_at else null end,
  r.created_at
from public.public_registrations r
where r.session_id is not null
  and r.email is not null
on conflict (session_id, email) do nothing;

insert into public.session_rsvps (
  session_id, email, status, sector_id, company_name,
  profile_id, company_id, source, confirmed_at
)
select
  c.session_id,
  lower(p.email),
  'confirmed',
  c.sector_id,
  c.legal_name,
  c.profile_id,
  c.id,
  'backfill',
  c.admitted_at
from public.companies c
join public.profiles p on p.id = c.profile_id
where c.admitted_at is not null
  and c.session_id is not null
  and p.email is not null
on conflict (session_id, email) do update
set
  status = 'confirmed',
  company_id = coalesce(public.session_rsvps.company_id, excluded.company_id),
  profile_id = coalesce(public.session_rsvps.profile_id, excluded.profile_id),
  sector_id = coalesce(public.session_rsvps.sector_id, excluded.sector_id),
  confirmed_at = coalesce(public.session_rsvps.confirmed_at, excluded.confirmed_at);

-- Admitidos sin session_id → Arranque (legacy Puebla x Puebla)
insert into public.session_rsvps (
  session_id, email, status, sector_id, company_name,
  profile_id, company_id, source, confirmed_at
)
select
  s.id,
  lower(p.email),
  'confirmed',
  c.sector_id,
  c.legal_name,
  c.profile_id,
  c.id,
  'backfill',
  c.admitted_at
from public.companies c
join public.profiles p on p.id = c.profile_id
cross join public.sessions s
where c.admitted_at is not null
  and c.session_id is null
  and p.email is not null
  and s.public_slug = '18-11-26-arranque-puebla-x-puebla'
on conflict (session_id, email) do nothing;
