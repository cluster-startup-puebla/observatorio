-- Pase QR persistido por RSVP (con o sin cuenta).
create table public.rsvp_passes (
  rsvp_id uuid primary key references public.session_rsvps (id) on delete cascade,
  session_id uuid not null references public.sessions (id) on delete cascade,
  image_asset_id uuid references public.media_assets (id) on delete set null,
  issued_at timestamptz not null default clock_timestamp()
);

create index rsvp_passes_session_idx on public.rsvp_passes (session_id);

comment on table public.rsvp_passes is
  'Correo con QR enviado para un RSVP confirmado. El QR es el id del RSVP.';

alter table public.rsvp_passes enable row level security;
alter table public.rsvp_passes force row level security;

create policy rsvp_passes_owner_read on public.rsvp_passes
  for select to authenticated
  using (
  exists (
    select 1
    from public.session_rsvps as r
    where r.id = rsvp_passes.rsvp_id
      and (
        r.profile_id = auth.uid()
        or (select private.is_superadmin())
      )
  )
);

create policy rsvp_passes_superadmin_write on public.rsvp_passes
  for all to authenticated
  using ((select private.is_superadmin()))
  with check ((select private.is_superadmin()));

grant select on public.rsvp_passes to authenticated;
grant select, insert, update, delete on public.rsvp_passes to authenticated;

create or replace function public.record_rsvp_pass(p_rsvp_id uuid, p_session_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.session_rsvps%rowtype;
begin
  select * into r from public.session_rsvps where id = p_rsvp_id;
  if r.id is null or r.status is distinct from 'confirmed' then
    raise exception 'rsvp_no_confirmado';
  end if;
  if p_session_id is distinct from r.session_id then
    raise exception 'sesion';
  end if;
  if not (
    (select private.is_superadmin())
    or r.profile_id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and lower(p.email) = r.email
    )
  ) then
    raise exception 'forbidden';
  end if;
  insert into public.rsvp_passes (rsvp_id, session_id, issued_at)
  values (p_rsvp_id, p_session_id, clock_timestamp())
  on conflict (rsvp_id) do nothing;
end;
$$;

revoke all on function public.record_rsvp_pass(uuid, uuid) from public;
grant execute on function public.record_rsvp_pass(uuid, uuid) to authenticated;