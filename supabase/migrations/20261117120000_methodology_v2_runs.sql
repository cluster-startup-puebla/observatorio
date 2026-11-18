create table public.methodology_v2_runs (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  instrument_id text not null,
  answers jsonb not null default '{}'::jsonb,
  cursor integer not null default 0,
  phase text not null default 'general',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  score jsonb,
  updated_at timestamptz not null default now(),
  constraint methodology_v2_runs_phase check (phase in ('general', 'curtain', 'sector', 'done'))
);

alter table public.methodology_v2_runs enable row level security;

create policy methodology_v2_runs_own on public.methodology_v2_runs
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy methodology_v2_runs_superadmin_select on public.methodology_v2_runs
  for select to authenticated
  using ((select private.is_superadmin()));

create index methodology_v2_runs_finished_idx
  on public.methodology_v2_runs (finished_at);
