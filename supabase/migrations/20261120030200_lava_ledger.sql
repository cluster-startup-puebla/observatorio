create table public.lava_ledger (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  action_code text not null references public.lava_actions (code),
  amount integer not null,
  ref_key text not null check (char_length(ref_key) between 1 and 120),
  origen text not null check (origen in ('live', 'backfill', 'manual')),
  note text check (note is null or char_length(note) between 1 and 280),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (company_id, action_code, ref_key)
);

create index lava_ledger_company_created_idx
  on public.lava_ledger (company_id, created_at desc);

comment on table public.lava_ledger is
  'Asientos de lavas. Inmutable: no update/delete. El saldo es la suma de amount por empresa.';

alter table public.lava_ledger enable row level security;
alter table public.lava_ledger force row level security;

create policy lava_ledger_owner_select
  on public.lava_ledger for select to authenticated
  using (
    (select private.is_superadmin())
    or company_id in (
      select c.id from public.companies c where c.profile_id = auth.uid()
    )
  );

-- Escritura solo vía RPC security definer (Task 4). Sin grant insert a authenticated.
revoke all on table public.lava_ledger from anon;
grant select on table public.lava_ledger to authenticated;
revoke insert on table public.lava_ledger from authenticated;
revoke update on table public.lava_ledger from authenticated;
revoke delete on table public.lava_ledger from authenticated;
