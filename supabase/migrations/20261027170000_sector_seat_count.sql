create table public.attendance_cancellations (
  company_id uuid primary key references public.companies (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (char_length(reason) between 1 and 280),
  cancelled_at timestamptz not null default clock_timestamp()
);

alter table public.attendance_cancellations enable row level security;
alter table public.attendance_cancellations force row level security;

create policy attendance_cancellations_owner_read on public.attendance_cancellations
  for select to authenticated
  using (profile_id = auth.uid() or (select private.is_superadmin()));

grant select on public.attendance_cancellations to authenticated;

create or replace function private.sector_occupied_ids(p_sector_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select c.id
  from public.companies c
  join public.profiles p on p.id = c.profile_id
  where c.sector_id = p_sector_id
    and p.role = 'empresario'
    and p.onboarded_at is not null
    and not exists (
      select 1 from public.attendance_cancellations x where x.company_id = c.id
    )
    and (
      (c.sector_source = 'path' and c.admitted_at is not null)
      or exists (
        select 1
        from public.crm_contacts k
        join public.crm_contact_status st on st.contact_id = k.id
        where k.source = 'enlace'
          and st.status in ('confirmo', 'registrado', 'llego')
          and lower(k.email) = lower(p.email)
      )
    );
$$;

create or replace function private.sector_is_full(p_sector_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  cap integer;
  taken integer;
begin
  select q.capacity into cap
  from public.session_sector_quotas q
  join public.sessions s on s.id = q.session_id
  where s.is_current
    and q.sector_id = p_sector_id
  for update of q;

  if cap is null then
    return false;
  end if;

  select count(*) into taken from private.sector_occupied_ids(p_sector_id);
  return taken >= cap;
end;
$$;

revoke all on function private.sector_occupied_ids(uuid) from public, anon, authenticated;
revoke all on function private.sector_is_full(uuid) from public, anon, authenticated;
