alter table public.public_registrations
  add column if not exists session_id uuid references public.sessions (id) on delete set null;

create index if not exists public_registrations_session_id_idx
  on public.public_registrations (session_id);

comment on column public.public_registrations.session_id is
  'Sesión/evento al que se registró. Distinto de session_interest (texto libre).';

drop function if exists public.start_public_registration(text, text, text, text, text, text);

create or replace function public.start_public_registration(
  full_name text,
  job_title text,
  email text,
  whatsapp text,
  sector_slug text,
  invite_token text,
  p_session_id uuid default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_email text := lower(btrim(email));
  clean_name text := btrim(full_name);
  clean_job text := btrim(job_title);
  clean_whatsapp text := nullif(regexp_replace(coalesce(whatsapp, ''), '[^0-9]', '', 'g'), '');
  clean_sector text := nullif(btrim(sector_slug), '');
  clean_invite text := nullif(btrim(invite_token), '');
  clean_session uuid := p_session_id;
  existing uuid;
begin
  if length(clean_name) < 2 or length(clean_job) < 2 then
    raise exception 'datos incompletos';
  end if;
  if clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'correo';
  end if;
  if clean_whatsapp is not null and clean_whatsapp !~ '^[0-9]{10,15}$' then
    raise exception 'whatsapp';
  end if;
  if clean_session is not null and not exists (
    select 1 from public.sessions as sessions where sessions.id = clean_session
  ) then
    raise exception 'sesion';
  end if;
  insert into public.public_registrations (
    email, full_name, job_title, whatsapp, sector_slug, invite_token, session_id
  )
  values (
    clean_email, clean_name, clean_job, clean_whatsapp, clean_sector, clean_invite, clean_session
  )
  on conflict on constraint public_registrations_email_key do nothing;
  select registration.id into existing
  from public.public_registrations as registration
  where registration.email = clean_email;
  if clean_session is not null then
    update public.public_registrations as registration
    set session_id = coalesce(registration.session_id, clean_session)
    where registration.id = existing
      and registration.poured_at is null;
  end if;
  return existing;
end;
$$;

revoke all on function public.start_public_registration(text, text, text, text, text, text, uuid) from public;
grant execute on function public.start_public_registration(text, text, text, text, text, text, uuid)
  to anon, authenticated;

notify pgrst, 'reload schema';
