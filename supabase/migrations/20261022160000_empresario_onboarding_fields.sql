alter table public.companies
  add column if not exists market_size text,
  add column if not exists municipality text,
  add column if not exists session_interest text;

alter table public.companies
  drop constraint if exists companies_market_size_check;

alter table public.companies
  add constraint companies_market_size_check
  check (
    market_size is null
    or market_size in ('local', 'regional', 'nacional', 'exportacion')
  );

alter table public.companies
  drop constraint if exists companies_municipality_length;

alter table public.companies
  add constraint companies_municipality_length
  check (municipality is null or char_length(municipality) between 2 and 80);

alter table public.companies
  drop constraint if exists companies_session_interest_length;

alter table public.companies
  add constraint companies_session_interest_length
  check (session_interest is null or char_length(session_interest) between 2 and 500);

comment on column public.companies.market_size is
  'Alcance de mercado: local, regional, nacional o exportacion.';

comment on column public.companies.municipality is
  'Municipio de Puebla del establecimiento.';

comment on column public.companies.session_interest is
  'Qué le interesa de la sesión. Texto libre del onboarding.';
