create or replace function public.approve_external_signup(company_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  src text;
  already timestamptz;
begin
  if auth.uid() is null then
    raise exception 'sin sesión';
  end if;
  if not (select private.is_superadmin()) then
    raise exception 'solo el superadmin acepta un registro externo';
  end if;
  select sector_source, admitted_at into src, already
  from public.companies
  where id = company_id;
  if src is distinct from 'path' then
    raise exception 'no llegó por un lugar desconocido';
  end if;
  if already is not null then
    raise exception 'ya está aceptada';
  end if;
  update public.companies
  set admitted_at = clock_timestamp(),
      admitted_by = auth.uid()
  where id = company_id;
end;
$$;

revoke all on function public.approve_external_signup(uuid) from public;
grant execute on function public.approve_external_signup(uuid) to authenticated;

revoke update (admitted_at, admitted_by) on public.companies from authenticated, anon;
