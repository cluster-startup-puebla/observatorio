-- Panel organismo: conversiones leen RSVPs atribuidos al org.
create policy session_rsvps_org_read on public.session_rsvps
  for select to authenticated
  using (
    organization_id is not null
    and organization_id = (select private.current_organization_id())
    and (select private.current_role()) in ('director', 'capturista')
  );