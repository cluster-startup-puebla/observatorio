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
