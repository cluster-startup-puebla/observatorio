-- Un registro público por persona y sesión (antes: uno por correo, global).
-- Respaldo previo: schema backup_20261126 (public_registrations, session_rsvps, function_defs).

alter table public.public_registrations
  drop constraint public_registrations_email_key;

alter table public.public_registrations
  add constraint public_registrations_email_session_key
  unique nulls not distinct (email, session_id);

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
  on conflict on constraint public_registrations_email_session_key do nothing;
  select registration.id into existing
  from public.public_registrations as registration
  where registration.email = clean_email
    and registration.session_id is not distinct from clean_session;
  return existing;
end;
$$;

-- pour.ts toma una sola fila: que sea la de registro más reciente.
create or replace function public.take_public_registration()
returns table (
  full_name text,
  job_title text,
  whatsapp text,
  company_name text,
  market_size text,
  employee_band text,
  municipality text,
  sector_slug text,
  referral_source text,
  session_interest text,
  invite_token text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  if clean_email = '' then return; end if;
  return query
  select registration.full_name, registration.job_title, registration.whatsapp,
         registration.company_name, registration.market_size, registration.employee_band,
         registration.municipality, registration.sector_slug, registration.referral_source,
         registration.session_interest, registration.invite_token
  from public.public_registrations as registration
  where registration.email = clean_email
    and registration.completed_at is not null
    and registration.poured_at is null
  order by registration.completed_at desc
  limit 1;
end;
$$;

notify pgrst, 'reload schema';
