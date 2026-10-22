create type public.account_role as enum (
  'empresario',
  'director',
  'capturista',
  'invitador',
  'superadmin',
  'moderador'
);

create type public.crm_status as enum (
  'cargado',
  'contactado',
  'confirmo',
  'registrado',
  'llego',
  'no'
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role public.account_role not null default 'empresario',
  onboarded boolean not null default false,
  sector_slug text,
  company_size text,
  name text,
  logo_key text,
  org_id uuid references public.people (id) on delete cascade,
  empresa text,
  status public.crm_status,
  created_at timestamptz not null default now(),
  constraint people_email_lowercase check (email = lower(email)),
  constraint people_email_shape check (email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  constraint people_org_not_self check (org_id is distinct from id)
);

create unique index people_account_email_key
  on public.people (email)
  where org_id is null;

create unique index people_invite_email_key
  on public.people (org_id, email)
  where org_id is not null;

create index people_org_id_idx on public.people (org_id);

create table public.answers (
  person_id text not null,
  question_id text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  primary key (person_id, question_id)
);

create table public.event_link_stats (
  org_id uuid not null references public.people (id) on delete cascade,
  sector_slug text not null,
  copies integer not null default 0,
  registrations integer not null default 0,
  primary key (org_id, sector_slug),
  constraint event_link_stats_nonnegative check (copies >= 0 and registrations >= 0),
  constraint event_link_stats_sector_present check (char_length(sector_slug) > 0)
);

create table public.outbox (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  subject text not null,
  created_at timestamptz not null default now(),
  constraint outbox_email_lowercase check (to_email = lower(to_email)),
  constraint outbox_email_shape check (to_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
);

alter table public.people enable row level security;
alter table public.answers enable row level security;
alter table public.event_link_stats enable row level security;
alter table public.outbox enable row level security;

revoke all on table public.people from anon, authenticated;
revoke all on table public.answers from anon, authenticated;
revoke all on table public.event_link_stats from anon, authenticated;
revoke all on table public.outbox from anon, authenticated;
