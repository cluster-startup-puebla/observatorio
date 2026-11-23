-- RSVP por (sesión, email). Cupo y pase viven aquí; la cuenta es opcional.
create table public.session_rsvps (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  email text not null check (email = lower(email)),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  sector_id uuid references public.sectors (id) on delete set null,
  sector_slug text,
  full_name text,
  company_name text,
  invite_token text,
  organization_id uuid references public.organizations (id) on delete set null,
  profile_id uuid references public.profiles (id) on delete set null,
  company_id uuid references public.companies (id) on delete set null,
  source text not null default 'public'
    check (source in ('public', 'app', 'admin', 'invite', 'backfill')),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  unique (session_id, email)
);

create index session_rsvps_email_idx on public.session_rsvps (email);
create index session_rsvps_session_status_idx on public.session_rsvps (session_id, status);
create index session_rsvps_profile_idx on public.session_rsvps (profile_id)
  where profile_id is not null;

comment on table public.session_rsvps is
  'Asiento por evento (estilo Luma). confirmed descuenta cupo; QR al confirmar sin exigir cuenta.';

alter table public.session_rsvps enable row level security;
alter table public.session_rsvps force row level security;

create policy session_rsvps_owner_read on public.session_rsvps
  for select to authenticated
  using (profile_id = auth.uid() or (select private.is_superadmin()));

create policy session_rsvps_superadmin_write on public.session_rsvps
  for all to authenticated
  using ((select private.is_superadmin()))
  with check ((select private.is_superadmin()));

grant select on public.session_rsvps to authenticated;
grant select, insert, update, delete on public.session_rsvps to authenticated;
