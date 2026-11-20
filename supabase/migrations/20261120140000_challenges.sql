-- Challenges + challenge_applications stub with RLS

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  created_by uuid not null references public.profiles (id),
  name text not null check (char_length(name) between 8 and 80),
  area text not null check (area in (
    'rrhh', 'finanzas', 'contabilidad', 'almacen', 'produccion',
    'compras', 'ventas', 'logistica', 'ti', 'calidad', 'otro'
  )),
  description_html text not null,
  success_metric text not null check (char_length(success_metric) between 8 and 500),
  sector_id uuid not null references public.sectors (id),
  urgency text check (urgency is null or urgency in ('baja', 'media', 'alta')),
  visibility text not null default 'red' check (visibility in ('portal', 'red')),
  show_company boolean not null default false,
  company_name_snapshot text check (
    company_name_snapshot is null
    or char_length(company_name_snapshot) between 2 and 160
  ),
  status text not null default 'borrador' check (
    status in ('borrador', 'publicado', 'oculto', 'cerrado')
  ),
  published_at timestamptz,
  hidden_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index challenges_company_id_idx on public.challenges (company_id);
create index challenges_portal_idx
  on public.challenges (published_at desc)
  where status = 'publicado' and visibility = 'portal';

create trigger challenges_updated_at
  before update on public.challenges
  for each row execute function private.set_updated_at();

create table public.challenge_applications (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  applicant_type text not null check (
    applicant_type in ('startup', 'incubadora', 'emprendedor')
  ),
  applicant_profile_id uuid references public.profiles (id) on delete set null,
  pitch text not null default '',
  status text not null default 'recibida' check (
    status in ('recibida', 'en_revision', 'aceptada', 'rechazada')
  ),
  created_at timestamptz not null default now()
);

create index challenge_applications_challenge_id_idx
  on public.challenge_applications (challenge_id);

alter table public.challenges enable row level security;
alter table public.challenge_applications enable row level security;

create policy challenges_own on public.challenges
  for all to authenticated
  using (
    (select private.is_superadmin())
    or company_id in (
      select id from public.companies where profile_id = (select auth.uid())
    )
  )
  with check (
    (select private.is_superadmin())
    or (
      company_id in (
        select id from public.companies where profile_id = (select auth.uid())
      )
      and created_by = (select auth.uid())
      and status in ('borrador', 'publicado', 'cerrado')
    )
  );

create policy challenges_portal_select on public.challenges
  for select to anon, authenticated
  using (status = 'publicado' and visibility = 'portal');

create policy challenges_superadmin_all on public.challenges
  for all to authenticated
  using ((select private.is_superadmin()))
  with check ((select private.is_superadmin()));

create policy challenge_applications_superadmin_select
  on public.challenge_applications
  for select to authenticated
  using ((select private.is_superadmin()));

comment on table public.challenge_applications is
  'Stub v1: applications UI comes later. Startups/incubadoras/emprendedores.';
