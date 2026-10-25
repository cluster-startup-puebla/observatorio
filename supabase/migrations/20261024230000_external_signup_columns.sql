alter table public.companies
  add column admitted_at timestamptz,
  add column admitted_by uuid references public.profiles (id) on delete set null;

comment on column public.companies.admitted_at is
  'Cuándo el superadmin aceptó un registro sin enlace. Null con sector_source path significa que sigue pendiente.';

comment on column public.companies.admitted_by is
  'Perfil del superadmin que aceptó. Null en las empresas path que ya existían al prender la regla.';

update public.companies
set admitted_at = clock_timestamp()
where sector_source = 'path'
  and admitted_at is null;
