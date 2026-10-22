-- Observatorio Tecnológico de Puebla
-- Reemplaza people / answers / event_link_stats / outbox.
-- El archivo vive en Storage. Postgres guarda la ficha (ruta, tipo, tamaño, pixeles).
-- Fuera de este esquema, porque la planeación no les dio forma:
--   analítica, módulo de conexiones y el reporte v/CSV.

drop view if exists public.event_conversion;
drop view if exists public.methodology_progress;
drop view if exists public.crm_contact_status;

drop table if exists public.outbox cascade;
drop table if exists public.event_link_stats cascade;
drop table if exists public.answers cascade;
drop table if exists public.people cascade;
drop type if exists public.crm_status;
drop type if exists public.account_role;

create schema if not exists private;

create type public.account_role as enum (
  'superadmin',
  'moderador',
  'empresario',
  'director',
  'capturista',
  'invitador'
);

create type public.employee_band as enum ('1_10', '11_50', '51_250', '250_plus');

create type public.sector_source as enum ('path', 'link', 'chosen');

create type public.contact_source as enum ('excel', 'manual', 'enlace');

create type public.crm_event as enum (
  'cargar',
  'contactar',
  'confirmar',
  'registrar',
  'llegar',
  'rechazar'
);

create type public.question_kind as enum ('single', 'priority', 'multi');

create type public.level_name as enum ('bronce', 'plata', 'oro');

create type public.mail_kind as enum ('password', 'event_pass', 'open_innovation');

create type public.media_purpose as enum (
  'organization_logo',
  'pass_qr',
  'content_image'
);

create table public.sectors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  position integer not null unique check (position > 0)
);

comment on table public.sectors is
  'Catálogo de sectores. El mensaje propio de cada uno vive en sector_pages y se llena en la etapa 2.';

create table public.sector_pages (
  sector_id uuid primary key references public.sectors (id) on delete cascade,
  headline text,
  body text,
  updated_at timestamptz not null default now()
);

comment on table public.sector_pages is
  'Mensaje de la landing /{sector}. Vacío en la etapa 1: la ruta solo selecciona el sector.';

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  venue text not null,
  format_name text not null,
  starts_local time not null,
  ends_local time not null,
  time_zone text not null default 'America/Mexico_City',
  capacity_min integer not null,
  capacity_max integer not null,
  audience text not null,
  includes text not null,
  is_current boolean not null default false,
  constraint sessions_capacity check (
    capacity_min > 0 and capacity_max >= capacity_min
  ),
  constraint sessions_hours check (ends_local > starts_local)
);

create unique index sessions_one_current_idx
  on public.sessions (is_current)
  where is_current;

comment on table public.sessions is
  'La sesión vigente. El cupo lo cambia el superadmin. No se inventa una fecha que la planeación no fijó.';

create table public.session_topics (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  position integer not null check (position > 0),
  title text not null,
  unique (session_id, position),
  unique (session_id, title)
);

create table public.content_blocks (
  slug text primary key,
  title text not null,
  body text not null,
  updated_at timestamptz not null default now()
);

comment on table public.content_blocks is
  'Textos que el superadmin puede cambiar: objetivo y bloque de VIA Partners. La imagen, si existe, es un media_assets de propósito content_image.';

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text,
  brand_color text,
  brand_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_color_hex check (
    brand_color is null or brand_color ~ '^#[0-9A-Fa-f]{6}$'
  ),
  constraint organizations_name_length check (
    name is null or char_length(name) between 2 and 160
  )
);

comment on table public.organizations is
  'Organismo que convoca. El logo no se guarda aquí: es la fila media_assets con purpose organization_logo. Sin marca terminada no se copia el enlace.';

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.account_role not null,
  full_name text,
  job_title text,
  whatsapp text,
  organization_id uuid references public.organizations (id),
  confidentiality_accepted_at timestamptz,
  methodology_confidentiality_accepted_at timestamptz,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_name_length check (
    full_name is null or char_length(full_name) between 2 and 120
  ),
  constraint profiles_job_length check (
    job_title is null or char_length(job_title) between 2 and 120
  ),
  constraint profiles_whatsapp check (
    whatsapp is null or whatsapp ~ '^[0-9]{10,15}$'
  ),
  constraint profiles_org_matches_role check (
    (
      role in ('director', 'capturista', 'invitador')
      and organization_id is not null
    )
    or (
      role in ('superadmin', 'moderador', 'empresario')
      and organization_id is null
    )
  )
);

comment on table public.profiles is
  'Persona con cuenta. El correo y la contraseña viven en auth.users. El rol no se lee de user_metadata.';

create unique index profiles_one_director_per_org_idx
  on public.profiles (organization_id)
  where role = 'director';

create index profiles_organization_id_idx on public.profiles (organization_id);
create index profiles_role_idx on public.profiles (role);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  legal_name text not null check (char_length(legal_name) between 2 and 160),
  sector_id uuid not null references public.sectors (id),
  sector_source public.sector_source not null,
  employee_band public.employee_band not null,
  referral_source text not null check (char_length(referral_source) between 2 and 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.companies.employee_band is
  '1_10 = 1–10, 11_50 = 11–50, 51_250 = 51–250, 250_plus = 250+.';

comment on column public.companies.sector_source is
  'path: vino en /{sector}. link: vino en el enlace del organismo. chosen: lo eligió la persona.';

create index companies_sector_id_idx on public.companies (sector_id);

create table public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  sector_id uuid references public.sectors (id),
  nombre text not null check (char_length(nombre) between 1 and 120),
  empresa text not null check (char_length(empresa) between 1 and 160),
  email text not null,
  source public.contact_source not null,
  profile_id uuid unique references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_contacts_email_lowercase check (email = lower(email)),
  constraint crm_contacts_email_shape check (
    email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  unique (organization_id, email)
);

comment on table public.crm_contacts is
  'Fila del CRM. Una fila repetida del mismo organismo y correo actualiza esta fila; no crea otra. El estatus no se guarda aquí: sale del último crm_events.';

create index crm_contacts_org_sector_source_idx
  on public.crm_contacts (organization_id, sector_id, source);

create table public.crm_events (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.crm_contacts (id) on delete cascade,
  event public.crm_event not null,
  actor_id uuid references public.profiles (id),
  occurred_at timestamptz not null default now()
);

comment on table public.crm_events is
  'Hechos del CRM. cargar abre cargado. contactar, confirmar, registrar, llegar y rechazar siguen la máquina de src/lib/crm-status.ts. Llegó solo con el hecho llegar, escrito desde la mesa.';

create index crm_events_contact_occurred_idx
  on public.crm_events (contact_id, occurred_at desc, id desc);

create table public.link_copies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  sector_id uuid not null references public.sectors (id),
  actor_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

comment on table public.link_copies is
  'Cada copia del enlace cifrado. La conversión es registros con source enlace entre estas copias, por organismo y sector.';

create index link_copies_org_sector_idx
  on public.link_copies (organization_id, sector_id);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  purpose public.media_purpose not null,
  bucket_id text not null,
  object_path text not null,
  content_type text not null,
  byte_size integer not null check (byte_size > 0),
  width_px integer check (width_px is null or width_px > 0),
  height_px integer check (height_px is null or height_px > 0),
  organization_id uuid references public.organizations (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete cascade,
  content_block_slug text references public.content_blocks (slug) on delete cascade,
  uploaded_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (bucket_id, object_path),
  constraint media_bucket_matches_purpose check (
    (
      purpose = 'organization_logo'
      and bucket_id = 'organization-logos'
      and organization_id is not null
      and profile_id is null
      and content_block_slug is null
      and object_path in (
        organization_id::text || '/logo.png',
        organization_id::text || '/logo.jpg',
        organization_id::text || '/logo.jpeg',
        organization_id::text || '/logo.webp'
      )
      and content_type in ('image/png', 'image/jpeg', 'image/webp')
      and byte_size <= 2097152
    )
    or (
      purpose = 'pass_qr'
      and bucket_id = 'pass-images'
      and profile_id is not null
      and organization_id is null
      and content_block_slug is null
      and object_path = profile_id::text || '/pass.png'
      and content_type = 'image/png'
      and byte_size <= 524288
    )
    or (
      purpose = 'content_image'
      and bucket_id = 'content-images'
      and content_block_slug is not null
      and organization_id is null
      and profile_id is null
      and object_path like content_block_slug || '/%'
      and content_type in ('image/png', 'image/jpeg', 'image/webp')
      and byte_size <= 4194304
    )
  )
);

comment on table public.media_assets is
  'Ficha de cada imagen. Los bytes están en Storage, en el bucket y la ruta de esta fila. Logo: organization-logos/{organization_id}/logo.png|jpg|jpeg|webp, máximo 2 MB. QR: pass-images/{profile_id}/pass.png, máximo 512 KB, solo PNG. Contenido: content-images/{slug}/archivo, máximo 4 MB.';

create unique index media_one_logo_per_org_idx
  on public.media_assets (organization_id)
  where purpose = 'organization_logo';

create unique index media_one_pass_per_profile_idx
  on public.media_assets (profile_id)
  where purpose = 'pass_qr';

create unique index media_one_image_per_block_idx
  on public.media_assets (content_block_slug)
  where purpose = 'content_image';

create table public.passes (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  image_asset_id uuid not null unique references public.media_assets (id),
  issued_at timestamptz not null default now()
);

comment on table public.passes is
  'Pase QR. Solo existe si el perfil ya terminó el onboarding. La imagen es el media_assets pass_qr de esa persona.';

create table public.arrivals (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  scanned_by uuid not null references public.profiles (id),
  scanned_at timestamptz not null default now()
);

comment on table public.arrivals is
  'Llegada en la mesa. Una persona entra una vez. Exige que el pase ya exista. Si además está en un CRM, el mismo acto escribe el hecho llegar.';

create table public.instrument_sections (
  id text primary key,
  name text not null unique,
  position integer not null unique check (position > 0),
  range_kind text not null check (range_kind in ('high', 'low'))
);

create table public.section_bands (
  section_id text not null references public.instrument_sections (id) on delete cascade,
  level public.level_name not null,
  min_score integer not null,
  max_score integer not null,
  riesgo text not null,
  reto text not null,
  primary key (section_id, level),
  constraint section_bands_range check (min_score >= 0 and max_score >= min_score)
);

create table public.integral_bands (
  level public.level_name primary key,
  min_score integer not null,
  max_score integer not null,
  riesgo text not null,
  reto text not null,
  constraint integral_bands_range check (min_score >= 0 and max_score >= min_score)
);

create table public.questions (
  id integer primary key check (id > 0),
  section_id text not null references public.instrument_sections (id),
  position integer not null check (position > 0),
  prompt text not null,
  kind public.question_kind not null,
  unique (section_id, position)
);

create table public.question_options (
  question_id integer not null references public.questions (id) on delete cascade,
  value text not null,
  label text not null,
  position integer not null check (position > 0),
  points integer check (points is null or points >= 0),
  severity integer check (severity is null or severity >= 0),
  primary key (question_id, value),
  unique (question_id, position)
);

comment on column public.question_options.points is
  'Puntos de una opción single o multi. a=1, b=2, c=4, d=6.';

comment on column public.question_options.severity is
  'Severidad de la causa que quedó en el rango 1 de una pregunta priority.';

create table public.question_conditions (
  question_id integer not null references public.questions (id) on delete cascade,
  depends_on_question_id integer not null references public.questions (id),
  expected_value text not null,
  primary key (question_id, depends_on_question_id, expected_value)
);

comment on table public.question_conditions is
  'Condición para mostrar una pregunta. El instrumento actual no tiene filas; el motor ya puede cargarlas sin otra migración.';

create table public.response_choices (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  question_id integer not null references public.questions (id),
  option_value text not null,
  rank integer check (rank is null or rank > 0),
  updated_at timestamptz not null default now(),
  primary key (profile_id, question_id, option_value),
  foreign key (question_id, option_value)
    references public.question_options (question_id, value)
);

comment on table public.response_choices is
  'Respuesta guardada al elegirla. single: una fila y rank nulo. multi: una fila por opción. priority: una fila por causa, con rank. El nivel Bronce, Plata u Oro se calcula; no se guarda.';

create index response_choices_profile_question_idx
  on public.response_choices (profile_id, question_id);

create table public.outbox_messages (
  id uuid primary key default gen_random_uuid(),
  kind public.mail_kind not null,
  to_email text not null,
  subject text not null,
  profile_id uuid references public.profiles (id),
  contact_id uuid references public.crm_contacts (id),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  constraint outbox_email_lowercase check (to_email = lower(to_email)),
  constraint outbox_email_shape check (
    to_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  constraint outbox_open_innovation_subject check (
    kind <> 'open_innovation'
    or subject = '¿Quieres ser una empresa de innovación abierta?'
  )
);

comment on table public.outbox_messages is
  'Bandeja. password: invitación a poner contraseña. event_pass: QR y detalles al terminar el onboarding. open_innovation: envío masivo del superadmin a quien ya está registrado. El cuerpo lo arma React Email; aquí queda el hecho y el asunto.';

create index outbox_messages_kind_created_idx
  on public.outbox_messages (kind, created_at);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sector_pages_updated_at
  before update on public.sector_pages
  for each row execute function private.set_updated_at();

create trigger content_blocks_updated_at
  before update on public.content_blocks
  for each row execute function private.set_updated_at();

create trigger organizations_updated_at
  before update on public.organizations
  for each row execute function private.set_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

create trigger companies_updated_at
  before update on public.companies
  for each row execute function private.set_updated_at();

create trigger crm_contacts_updated_at
  before update on public.crm_contacts
  for each row execute function private.set_updated_at();

create or replace function private.enforce_crm_transition()
returns trigger
language plpgsql
as $$
declare
  current_status text;
begin
  select case event
    when 'cargar' then 'cargado'
    when 'contactar' then 'contactado'
    when 'confirmar' then 'confirmo'
    when 'registrar' then 'registrado'
    when 'llegar' then 'llego'
    when 'rechazar' then 'no'
  end
  into current_status
  from public.crm_events
  where contact_id = new.contact_id
  order by occurred_at desc, id desc
  limit 1;

  if new.event = 'cargar' then
    if current_status is not null then
      raise exception 'transición inválida';
    end if;
    return new;
  end if;

  if current_status is null
    or not (
      (current_status = 'cargado' and new.event in ('contactar', 'confirmar', 'rechazar'))
      or (current_status = 'contactado' and new.event in ('confirmar', 'rechazar'))
      or (current_status = 'confirmo' and new.event in ('registrar', 'rechazar'))
      or (current_status = 'registrado' and new.event in ('llegar', 'rechazar'))
    )
  then
    raise exception 'transición inválida';
  end if;

  return new;
end;
$$;

create trigger crm_events_transition
  before insert on public.crm_events
  for each row execute function private.enforce_crm_transition();

create or replace function private.require_completed_brand()
returns trigger
language plpgsql
as $$
begin
  if new.brand_completed_at is null then
    return new;
  end if;
  if new.name is null or new.brand_color is null then
    raise exception 'faltan nombre o color';
  end if;
  if not exists (
    select 1
    from public.media_assets
    where organization_id = new.id
      and purpose = 'organization_logo'
  ) then
    raise exception 'falta el logo';
  end if;
  return new;
end;
$$;

create trigger organizations_require_brand
  before insert or update on public.organizations
  for each row execute function private.require_completed_brand();

create or replace function private.require_pass_rules()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.profiles
    where id = new.profile_id
      and onboarded_at is not null
  ) then
    raise exception 'sin perfil terminado';
  end if;
  if not exists (
    select 1
    from public.media_assets
    where id = new.image_asset_id
      and purpose = 'pass_qr'
      and profile_id = new.profile_id
  ) then
    raise exception 'el pase no apunta a su imagen';
  end if;
  return new;
end;
$$;

create trigger passes_require_rules
  before insert or update on public.passes
  for each row execute function private.require_pass_rules();

create or replace function private.require_arrival_pass()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.passes where profile_id = new.profile_id
  ) then
    raise exception 'sin qr';
  end if;
  return new;
end;
$$;

create trigger arrivals_require_pass
  before insert on public.arrivals
  for each row execute function private.require_arrival_pass();

create or replace function private.require_link_copy_brand()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.organizations
    where id = new.organization_id
      and brand_completed_at is not null
  ) then
    raise exception 'la marca no está terminada';
  end if;
  return new;
end;
$$;

create trigger link_copies_require_brand
  before insert on public.link_copies
  for each row execute function private.require_link_copy_brand();

create view public.crm_contact_status
with (security_invoker = true) as
select distinct on (contact_id)
  contact_id,
  case event
    when 'cargar' then 'cargado'
    when 'contactar' then 'contactado'
    when 'confirmar' then 'confirmo'
    when 'registrar' then 'registrado'
    when 'llegar' then 'llego'
    when 'rechazar' then 'no'
  end as status,
  event,
  actor_id,
  occurred_at
from public.crm_events
order by contact_id, occurred_at desc, id desc;

comment on view public.crm_contact_status is
  'Estatus vigente de cada contacto. security_invoker: respeta el RLS de crm_events.';

create view public.methodology_progress
with (security_invoker = true) as
select
  profile_id,
  count(distinct question_id) as answered,
  max(updated_at) as last_saved_at
from public.response_choices
group by profile_id;

comment on view public.methodology_progress is
  'Cuántas preguntas lleva cada persona. El panel del superadmin y del moderador lee esta vista.';

create view public.event_conversion
with (security_invoker = true) as
select
  copies.organization_id,
  copies.sector_id,
  copies.copies,
  coalesce(registrations.registrations, 0) as registrations
from (
  select organization_id, sector_id, count(*) as copies
  from public.link_copies
  group by organization_id, sector_id
) as copies
left join (
  select organization_id, sector_id, count(*) as registrations
  from public.crm_contacts
  where source = 'enlace'
  group by organization_id, sector_id
) as registrations
  on registrations.organization_id = copies.organization_id
 and registrations.sector_id = copies.sector_id;

comment on view public.event_conversion is
  'Registros atribuidos entre copias del enlace, por organismo y sector.';
