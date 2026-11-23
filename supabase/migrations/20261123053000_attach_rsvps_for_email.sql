-- Al crear/tener cuenta, liga RSVPs del mismo correo al profile/company.
create or replace function public.attach_rsvps_for_email()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  mail text;
  firm uuid;
  n integer := 0;
begin
  if uid is null then raise exception 'sin sesión'; end if;
  select lower(p.email) into mail from public.profiles p where p.id = uid;
  if mail is null then return 0; end if;
  select c.id into firm from public.companies c where c.profile_id = uid limit 1;

  update public.session_rsvps
  set profile_id = uid,
      company_id = coalesce(firm, company_id),
      updated_at = clock_timestamp()
  where email = mail
    and (profile_id is distinct from uid or company_id is distinct from firm);

  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.attach_rsvps_for_email() from public;
grant execute on function public.attach_rsvps_for_email() to authenticated;
