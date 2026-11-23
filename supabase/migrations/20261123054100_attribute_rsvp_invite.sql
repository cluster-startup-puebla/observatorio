-- Org attribution on RSVP from público registro (invite token resolved in app).
create or replace function public.attribute_rsvp_invite(
  p_registration_id uuid,
  p_org_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  row public.public_registrations%rowtype;
  clean_org uuid := p_org_id;
begin
  if clean_org is null then
    return;
  end if;
  if not exists (
    select 1 from public.organizations as organizations
    where organizations.id = clean_org and organizations.brand_completed_at is not null
  ) then
    return;
  end if;
  select * into row from public.public_registrations where id = p_registration_id;
  if row.id is null or row.session_id is null then
    return;
  end if;
  perform public.sync_public_registration_rsvp(p_registration_id);
  update public.session_rsvps as rsvp
  set organization_id = clean_org,
      invite_token = coalesce(
        rsvp.invite_token,
        nullif(btrim(row.invite_token), '')
      ),
      updated_at = clock_timestamp()
  where rsvp.session_id = row.session_id and rsvp.email = row.email;
end;
$$;

revoke all on function public.attribute_rsvp_invite(uuid, uuid) from public;
grant execute on function public.attribute_rsvp_invite(uuid, uuid) to anon, authenticated;