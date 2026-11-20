create table public.lava_boost_config (
  id integer primary key default 1 check (id = 1),
  multiplier numeric(6, 2) not null default 1.00 check (multiplier >= 0),
  flat_bonus integer not null default 0 check (flat_bonus >= 0),
  updated_at timestamptz not null default now()
);

comment on table public.lava_boost_config is
  'Boost EIA para lavas: awarded = round(base * multiplier) + flat_bonus cuando la empresa tiene accepted_at.';

alter table public.lava_boost_config enable row level security;
alter table public.lava_boost_config force row level security;

create policy lava_boost_read
  on public.lava_boost_config for select to authenticated
  using (true);

create policy lava_boost_superadmin_write
  on public.lava_boost_config for all to authenticated
  using ((select private.is_superadmin()))
  with check ((select private.is_superadmin()));

grant select on table public.lava_boost_config to authenticated;
grant insert, update on table public.lava_boost_config to authenticated;

insert into public.lava_boost_config (id, multiplier, flat_bonus)
values (1, 1.00, 0);
