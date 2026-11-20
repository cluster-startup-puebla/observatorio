alter table public.companies
  add column website text;

alter table public.companies
  add constraint companies_website_check
  check (
    website is null
    or (
      char_length(website) between 4 and 200
      and website ~* '^(https://)?([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$'
    )
  );

comment on column public.companies.website is
  'Sitio de la empresa. Nulo, o un dominio como ejemplo.com o https://ejemplo.com.';
