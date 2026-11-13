create table public.public_registrations (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  full_name text not null,
  job_title text not null,
  whatsapp text,
  company_name text,
  market_size text,
  employee_band text,
  municipality text,
  sector_slug text,
  referral_source text,
  session_interest text,
  invite_token text,
  completed_at timestamptz,
  poured_at timestamptz,
  poured_profile_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.public_registrations enable row level security;

create or replace function public.start_public_registration(
  full_name text,
  job_title text,
  email text,
  whatsapp text,
  sector_slug text,
  invite_token text
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
  insert into public.public_registrations (email, full_name, job_title, whatsapp, sector_slug, invite_token)
  values (clean_email, clean_name, clean_job, clean_whatsapp, clean_sector, clean_invite)
  on conflict on constraint public_registrations_email_key do nothing;
  select registration.id into existing
  from public.public_registrations as registration
  where registration.email = clean_email;
  return existing;
end;
$$;

revoke all on function public.start_public_registration(text, text, text, text, text, text) from public;
grant execute on function public.start_public_registration(text, text, text, text, text, text) to anon, authenticated;

create or replace function public.finish_public_registration(
  registration_id uuid,
  company_name text,
  market_size text,
  employee_band text,
  municipality text,
  sector_slug text,
  referral_source text,
  session_interest text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_company text := btrim(company_name);
  clean_market text := btrim(market_size);
  clean_band text := btrim(employee_band);
  clean_municipality text := btrim(municipality);
  clean_sector text := nullif(btrim(sector_slug), '');
  clean_referral text := btrim(referral_source);
  clean_interest text := btrim(session_interest);
begin
  if length(clean_company) < 2 or length(clean_referral) < 2 then
    raise exception 'datos incompletos';
  end if;
  if length(clean_interest) < 2 or length(clean_interest) > 500 then
    raise exception 'interes';
  end if;
  update public.public_registrations as registration set
    company_name = clean_company,
    market_size = clean_market,
    employee_band = clean_band,
    municipality = clean_municipality,
    sector_slug = coalesce(clean_sector, registration.sector_slug),
    referral_source = clean_referral,
    session_interest = clean_interest,
    completed_at = now()
  where registration.id = registration_id and registration.poured_at is null;
  if not found then raise exception 'no se puede cerrar'; end if;
end;
$$;

revoke all on function public.finish_public_registration(uuid, text, text, text, text, text, text, text) from public;
grant execute on function public.finish_public_registration(uuid, text, text, text, text, text, text, text) to anon, authenticated;

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
  if clean_email = '' then
    return;
  end if;
  return query
    select
      registration.full_name,
      registration.job_title,
      registration.whatsapp,
      registration.company_name,
      registration.market_size,
      registration.employee_band,
      registration.municipality,
      registration.sector_slug,
      registration.referral_source,
      registration.session_interest,
      registration.invite_token
    from public.public_registrations as registration
    where registration.email = clean_email
      and registration.completed_at is not null
      and registration.poured_at is null;
end;
$$;

revoke all on function public.take_public_registration() from public, anon;
grant execute on function public.take_public_registration() to authenticated;

create or replace function public.mark_public_registration_poured(profile_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  update public.public_registrations
  set poured_at = now(), poured_profile_id = profile_id
  where email = clean_email
    and completed_at is not null
    and poured_at is null;
  if not found then
    raise exception 'no se puede volcar';
  end if;
end;
$$;

revoke all on function public.mark_public_registration_poured(uuid) from public, anon;
grant execute on function public.mark_public_registration_poured(uuid) to authenticated;
