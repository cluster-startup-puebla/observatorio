alter function private.set_updated_at() set search_path = '';
alter function private.enforce_crm_transition() set search_path = '';
alter function private.require_completed_brand() set search_path = '';
alter function private.require_pass_rules() set search_path = '';
alter function private.require_arrival_pass() set search_path = '';
alter function private.require_link_copy_brand() set search_path = '';

revoke all on function public.rls_auto_enable() from public, anon, authenticated;

create index if not exists arrivals_scanned_by_idx on public.arrivals (scanned_by);
create index if not exists crm_contacts_sector_id_idx on public.crm_contacts (sector_id);
create index if not exists crm_events_actor_id_idx on public.crm_events (actor_id);
create index if not exists link_copies_actor_id_idx on public.link_copies (actor_id);
create index if not exists link_copies_sector_id_idx on public.link_copies (sector_id);
create index if not exists media_assets_uploaded_by_idx on public.media_assets (uploaded_by);
create index if not exists outbox_messages_contact_id_idx on public.outbox_messages (contact_id);
create index if not exists outbox_messages_created_by_idx on public.outbox_messages (created_by);
create index if not exists outbox_messages_profile_id_idx on public.outbox_messages (profile_id);
create index if not exists question_conditions_depends_on_idx on public.question_conditions (depends_on_question_id);
create index if not exists response_choices_question_option_idx on public.response_choices (question_id, option_value);

drop policy profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or private.is_superadmin());

drop policy profiles_insert_empresario on public.profiles;
create policy profiles_insert_empresario on public.profiles
  for insert to authenticated
  with check (
    id = (select auth.uid())
    and role = 'empresario'
    and organization_id is null
  );

drop policy profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and role = (select private.current_role())
    and organization_id is not distinct from (select private.current_organization_id())
  );

drop policy companies_own on public.companies;
create policy companies_own on public.companies
  for all to authenticated
  using (profile_id = (select auth.uid()) or (select private.is_superadmin()))
  with check (profile_id = (select auth.uid()) or (select private.is_superadmin()));

drop policy link_copies_insert on public.link_copies;
create policy link_copies_insert on public.link_copies
  for insert to authenticated
  with check (
    actor_id = (select auth.uid())
    and (
      (select private.is_superadmin())
      or (
        organization_id = (select private.current_organization_id())
        and (select private.current_role()) in ('director', 'invitador')
      )
    )
  );

drop policy media_select on public.media_assets;
create policy media_select on public.media_assets
  for select to authenticated
  using (
    (select private.is_superadmin())
    or uploaded_by = (select auth.uid())
    or profile_id = (select auth.uid())
    or (
      purpose = 'organization_logo'
      and organization_id = (select private.current_organization_id())
      and (select private.current_role()) = 'director'
    )
    or (
      purpose = 'pass_qr'
      and (select private.current_role()) = 'moderador'
    )
  );

drop policy media_logo_write on public.media_assets;
create policy media_logo_write on public.media_assets
  for insert to authenticated
  with check (
    purpose = 'organization_logo'
    and uploaded_by = (select auth.uid())
    and organization_id = (select private.current_organization_id())
    and (select private.current_role()) = 'director'
  );

drop policy media_pass_write on public.media_assets;
create policy media_pass_write on public.media_assets
  for insert to authenticated
  with check (
    purpose = 'pass_qr'
    and profile_id = (select auth.uid())
    and uploaded_by = (select auth.uid())
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.onboarded_at is not null
    )
  );

drop policy passes_select on public.passes;
create policy passes_select on public.passes
  for select to authenticated
  using (
    profile_id = (select auth.uid())
    or (select private.current_role()) in ('superadmin', 'moderador')
  );

drop policy passes_insert_own on public.passes;
create policy passes_insert_own on public.passes
  for insert to authenticated
  with check (profile_id = (select auth.uid()));

drop policy arrivals_select on public.arrivals;
create policy arrivals_select on public.arrivals
  for select to authenticated
  using (
    profile_id = (select auth.uid())
    or (select private.current_role()) in ('superadmin', 'moderador')
  );

drop policy arrivals_insert_desk on public.arrivals;
create policy arrivals_insert_desk on public.arrivals
  for insert to authenticated
  with check (
    scanned_by = (select auth.uid())
    and (select private.current_role()) in ('superadmin', 'moderador')
  );

drop policy responses_own on public.response_choices;
create policy responses_own on public.response_choices
  for all to authenticated
  using (profile_id = (select auth.uid()) or (select private.is_superadmin()))
  with check (
    (profile_id = (select auth.uid()) and (select private.current_role()) = 'empresario')
    or (select private.is_superadmin())
  );

drop policy outbox_open_innovation_insert on public.outbox_messages;
create policy outbox_open_innovation_insert on public.outbox_messages
  for insert to authenticated
  with check (
    kind = 'open_innovation'
    and created_by = (select auth.uid())
    and (select private.is_superadmin())
  );

drop policy storage_pass_owner_select on storage.objects;
create policy storage_pass_owner_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'pass-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy storage_pass_owner_insert on storage.objects;
create policy storage_pass_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'pass-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.onboarded_at is not null
    )
  );

drop policy storage_pass_owner_update on storage.objects;
create policy storage_pass_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'pass-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'pass-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
