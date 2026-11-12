create policy media_pass_accept_write on public.media_assets
  for insert to authenticated
  with check (
    purpose = 'pass_qr'
    and bucket_id = 'pass-images'
    and uploaded_by = profile_id
    and object_path = profile_id::text || '/pass.png'
    and content_type = 'image/png'
    and (
      (select private.is_superadmin())
      or exists (
        select 1
        from public.profiles as guest
        join public.crm_contacts as contact
          on lower(contact.email) = lower(guest.email)
        join public.crm_contact_status as status
          on status.contact_id = contact.id
        where guest.id = profile_id
          and contact.source = 'enlace'
          and contact.organization_id = (select private.current_organization_id())
          and (select private.current_role()) in ('director', 'capturista')
          and status.status in ('confirmo', 'registrado', 'llego')
      )
    )
  );

create policy passes_insert_accepted on public.passes
  for insert to authenticated
  with check (
    (select private.is_superadmin())
    or exists (
      select 1
      from public.profiles as guest
      join public.crm_contacts as contact
        on lower(contact.email) = lower(guest.email)
      join public.crm_contact_status as status
        on status.contact_id = contact.id
      where guest.id = profile_id
        and contact.source = 'enlace'
        and contact.organization_id = (select private.current_organization_id())
        and (select private.current_role()) in ('director', 'capturista')
        and status.status in ('confirmo', 'registrado', 'llego')
    )
  );

create policy storage_pass_staff_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'pass-images'
    and (select private.current_role()) in ('superadmin', 'moderador')
  );

create policy storage_pass_accept_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'pass-images'
    and (
      (select private.is_superadmin())
      or exists (
        select 1
        from public.profiles as guest
        join public.crm_contacts as contact
          on lower(contact.email) = lower(guest.email)
        join public.crm_contact_status as status
          on status.contact_id = contact.id
        where guest.id::text = (storage.foldername(name))[1]
          and contact.source = 'enlace'
          and contact.organization_id = (select private.current_organization_id())
          and (select private.current_role()) in ('director', 'capturista')
          and status.status in ('confirmo', 'registrado', 'llego')
      )
    )
  );

create policy storage_pass_accept_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'pass-images'
    and (select private.is_superadmin())
  )
  with check (
    bucket_id = 'pass-images'
    and (select private.is_superadmin())
  );
