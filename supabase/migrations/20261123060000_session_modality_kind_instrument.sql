create type public.session_modality as enum ('presencial', 'hibrido', 'en_linea');
create type public.session_kind as enum ('foro', 'evento');

alter table public.sessions
  add column modality public.session_modality not null default 'presencial',
  add column kind public.session_kind not null default 'foro',
  add column instrument_id text;

comment on column public.sessions.modality is
  'Cómo se entrega la sesión: presencial, híbrido o en línea.';

comment on column public.sessions.kind is
  'Plantilla replicable: foro (Observatorio con cupos por sector) o evento (convocatoria abierta).';

comment on column public.sessions.instrument_id is
  'Id del instrumento v2 si la sesión trae un test fijo. Null = se resuelve por sector.';

update public.sessions
set kind = 'foro', modality = 'presencial'
where public_slug = '18-11-26-arranque-puebla-x-puebla';

update public.sessions
set kind = 'evento', modality = 'presencial'
where public_slug = '28-11-26-disruptors-2026';
