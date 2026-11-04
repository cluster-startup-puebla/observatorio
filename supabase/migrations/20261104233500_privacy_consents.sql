create table public.privacy_consents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  notice text not null,
  notice_version text not null,
  accepted_at timestamptz not null default now(),
  constraint privacy_consents_notice check (
    notice in ('aviso-de-privacidad', 'uso-de-datos')
  ),
  constraint privacy_consents_version check (char_length(notice_version) between 8 and 40),
  unique (profile_id, notice, notice_version)
);

comment on table public.privacy_consents is
  'Prueba del consentimiento. Una fila por aviso y versión aceptados en el onboarding.';

alter table public.privacy_consents enable row level security;
alter table public.privacy_consents force row level security;

create policy privacy_consents_read on public.privacy_consents
  for select to authenticated
  using (
    profile_id = (select auth.uid())
    or (select private.is_superadmin())
  );

revoke all on table public.privacy_consents from public, anon;
grant select on table public.privacy_consents to authenticated;

create or replace function public.record_privacy_consent()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'forbidden';
  end if;
  insert into public.privacy_consents (profile_id, notice, notice_version)
  values
    (auth.uid(), 'aviso-de-privacidad', '2026-10-15'),
    (auth.uid(), 'uso-de-datos', '2026-10-15')
  on conflict (profile_id, notice, notice_version) do nothing;
  update public.profiles
  set confidentiality_accepted_at = coalesce(confidentiality_accepted_at, now())
  where id = auth.uid();
end;
$$;

revoke all on function public.record_privacy_consent() from public, anon;
grant execute on function public.record_privacy_consent() to authenticated;
