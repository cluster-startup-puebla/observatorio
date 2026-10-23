alter table public.sessions
  add column session_on date;

update public.sessions
set session_on = date '2026-11-12'
where session_on is null;

alter table public.sessions
  alter column session_on set not null;

drop index if exists public.sessions_one_current_idx;

alter table public.link_copies
  add column session_id uuid references public.sessions (id);

comment on table public.sessions is
  'Sesión del observatorio. Puede haber varias vigentes a la vez. La fecha vive en session_on.';

comment on column public.sessions.session_on is
  'Fecha de la sesión. Las filas que ya existían quedaron en 2026-11-12.';

comment on column public.link_copies.session_id is
  'Sesión elegida al generar el enlace. Nulo si no había una vigente.';
