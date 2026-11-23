-- Mesa: cuenta con pase legacy o RSVP confirmado con rsvp_passes.
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
    and (
      exists (select 1 from public.passes where passes.profile_id = guest_id)
      or exists (
        select 1
        from public.session_rsvps as r
        join public.rsvp_passes as rp on rp.rsvp_id = r.id
        where r.profile_id = guest_id
          and r.status = 'confirmed'
      )
    )
    and (select private.current_role()) in (
      'superadmin'::public.account_role,
      'moderador'::public.account_role
    );
$$;

-- RSVP guest: enriquecer empresa/sector desde la cuenta cuando exista.
create or replace function public.mesa_rsvp_guest(p_rsvp_id uuid)
returns table (
  full_name text,
  company_name text,
  sector_name text,
  invited_by text,
  profile_id uuid
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce(
      nullif(btrim(profile.full_name), ''),
      nullif(btrim(r.full_name), ''),
      nullif(btrim(r.email), '')
    ),
    coalesce(
      nullif(btrim(company.legal_name), ''),
      nullif(btrim(r.company_name), '')
    ),
    coalesce(sector.name, company_sector.name, nullif(btrim(r.sector_slug), '')),
    ''::text,
    r.profile_id
  from public.session_rsvps as r
  left join public.profiles as profile on profile.id = r.profile_id
  left join public.companies as company on company.profile_id = r.profile_id
  left join public.sectors as sector on sector.id = r.sector_id
  left join public.sectors as company_sector on company_sector.id = company.sector_id
  where r.id = p_rsvp_id
    and r.status = 'confirmed'
    and (select private.current_role()) in (
      'superadmin'::public.account_role,
      'moderador'::public.account_role
    );
$$;

notify pgrst, 'reload schema';
