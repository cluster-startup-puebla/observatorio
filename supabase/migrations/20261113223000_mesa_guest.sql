create or replace function public.mesa_guest(guest_id uuid)
returns table (
  full_name text,
  company_name text,
  sector_name text,
  invited_by text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    profile.full_name,
    company.legal_name,
    sector.name,
    coalesce(
      (
        select org.name
        from public.crm_contacts as contact
        join public.organizations as org on org.id = contact.organization_id
        where contact.source = 'enlace'
          and (
            contact.profile_id = profile.id
            or (profile.email is not null and contact.email = lower(profile.email))
          )
        order by org.name
        limit 1
      ),
      company.referral_source
    )
  from public.profiles as profile
  left join public.companies as company on company.profile_id = profile.id
  left join public.sectors as sector on sector.id = company.sector_id
  where profile.id = guest_id
    and exists (select 1 from public.passes where passes.profile_id = guest_id)
    and (select private.current_role()) in (
      'superadmin'::public.account_role,
      'moderador'::public.account_role
    );
$$;

revoke all on function public.mesa_guest(uuid) from public, anon;
grant execute on function public.mesa_guest(uuid) to authenticated;

notify pgrst, 'reload schema';
