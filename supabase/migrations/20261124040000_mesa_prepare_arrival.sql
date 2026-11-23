-- Mesa: resolver QR (RSVP o perfil) como security definer; bypasea FORCE RLS en lecturas.
create or replace function public.mesa_prepare_arrival(p_code text)
returns table (
  ok boolean,
  reason text,
  profile_id uuid,
  rsvp_id uuid,
  full_name text,
  company_name text,
  sector_name text,
  invited_by text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  code uuid;
  rid uuid;
  pid uuid;
  has_pass boolean := false;
  already boolean := false;
begin
  if auth.uid() is null then
    ok := false; reason := 'sin sesión'; return next; return;
  end if;
  if (select private.current_role()) not in (
    'superadmin'::public.account_role,
    'moderador'::public.account_role
  ) then
    ok := false; reason := 'sin sesión'; return next; return;
  end if;

  begin
    code := nullif(btrim(p_code), '')::uuid;
  exception
    when invalid_text_representation then
      code := null;
  end;

  if code is not null then
    select r.id, r.profile_id into rid, pid
    from public.session_rsvps as r
    where r.id = code and r.status = 'confirmed';
  end if;

  if rid is null and code is not null then
    select r.id, r.profile_id into rid, pid
    from public.session_rsvps as r
    join public.rsvp_passes as rp on rp.rsvp_id = r.id
    where r.profile_id = code and r.status = 'confirmed'
    order by r.confirmed_at desc nulls last
    limit 1;
  end if;

  if rid is null and code is not null and exists (
    select 1 from public.passes as p where p.profile_id = code
  ) then
    pid := code;
    has_pass := true;
  end if;

  if rid is not null then
    has_pass := exists (select 1 from public.rsvp_passes as rp where rp.rsvp_id = rid)
      or (pid is not null and exists (select 1 from public.passes as p where p.profile_id = pid));
  end if;

  if not has_pass then
    ok := false; reason := 'sin qr'; return next; return;
  end if;

  if pid is not null then
    already := exists (select 1 from public.arrivals as a where a.profile_id = pid);
    if already then
      ok := false; reason := 'ya llegó'; profile_id := pid; rsvp_id := rid; return next; return;
    end if;
  end if;

  ok := true;
  reason := null;
  profile_id := pid;
  rsvp_id := rid;

  if pid is not null then
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
    into full_name, company_name, sector_name, invited_by
    from public.profiles as profile
    left join public.companies as company on company.profile_id = profile.id
    left join public.sectors as sector on sector.id = company.sector_id
    where profile.id = pid;
  elsif rid is not null then
    select
      coalesce(nullif(btrim(r.full_name), ''), nullif(btrim(r.email), '')),
      nullif(btrim(r.company_name), ''),
      coalesce(sector.name, nullif(btrim(r.sector_slug), '')),
      ''::text
    into full_name, company_name, sector_name, invited_by
    from public.session_rsvps as r
    left join public.sectors as sector on sector.id = r.sector_id
    where r.id = rid;
  end if;

  return next;
end;
$$;

revoke all on function public.mesa_prepare_arrival(text) from public, anon;
grant execute on function public.mesa_prepare_arrival(text) to authenticated;

notify pgrst, 'reload schema';
