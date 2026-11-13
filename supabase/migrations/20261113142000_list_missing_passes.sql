create or replace function public.list_missing_passes()
returns setof uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not (select private.is_superadmin()) then
    raise exception 'sin sesión';
  end if;
  return query
  select profile.id
  from public.profiles as profile
  where profile.role = 'empresario'
    and profile.onboarded_at is not null
    and not exists (
      select 1 from public.passes as pass where pass.profile_id = profile.id
    )
    and (
      exists (
        select 1 from public.companies as company
        where company.profile_id = profile.id
          and company.sector_source = 'path'
          and company.admitted_at is not null
      )
      or exists (
        select 1
        from public.crm_contacts as contact
        join public.crm_contact_status as status on status.contact_id = contact.id
        where contact.source = 'enlace'
          and lower(contact.email) = lower(profile.email)
          and status.status in ('confirmo', 'registrado', 'llego')
      )
    );
end;
$$;

revoke all on function public.list_missing_passes() from public, anon;
grant execute on function public.list_missing_passes() to authenticated;
