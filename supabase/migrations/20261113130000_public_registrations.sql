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
  clean_whatsapp text := nullif(regexp_replace(coalesce(whatsapp, ''), '[^0-9]', '', 'g'), '');
  existing uuid;
begin
  if length(btrim(full_name)) < 2 or length(btrim(job_title)) < 2 then
    raise exception 'datos incompletos';
  end if;
  if clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'correo';
  end if;
  if clean_whatsapp is not null and clean_whatsapp !~ '^[0-9]{10,15}$' then
    raise exception 'whatsapp';
  end if;
  insert into public.public_registrations (email, full_name, job_title, whatsapp, sector_slug, invite_token)
  values (clean_email, btrim(full_name), btrim(job_title), clean_whatsapp, nullif(btrim(sector_slug), ''), nullif(btrim(invite_token), ''))
  on conflict (email) do nothing;
  select id into existing from public.public_registrations where public_registrations.email = clean_email;
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
begin
  if length(btrim(company_name)) < 2 or length(btrim(referral_source)) < 2 then
    raise exception 'datos incompletos';
  end if;
  if length(btrim(session_interest)) < 2 or length(btrim(session_interest)) > 500 then
    raise exception 'interes';
  end if;
  update public.public_registrations set
    company_name = btrim(company_name),
    market_size = btrim(market_size),
    employee_band = btrim(employee_band),
    municipality = btrim(municipality),
    sector_slug = coalesce(nullif(btrim(sector_slug), ''), public_registrations.sector_slug),
    referral_source = btrim(referral_source),
    session_interest = btrim(session_interest),
    completed_at = now()
  where id = registration_id and poured_at is null;
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
