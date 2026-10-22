do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'sectors',
    'sector_pages',
    'sessions',
    'session_topics',
    'content_blocks',
    'instrument_sections',
    'section_bands',
    'integral_bands',
    'questions',
    'question_options',
    'question_conditions'
  ]
  loop
    execute format('drop policy %I on public.%I', table_name || '_superadmin_write', table_name);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select private.is_superadmin()))',
      table_name || '_superadmin_insert',
      table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select private.is_superadmin())) with check ((select private.is_superadmin()))',
      table_name || '_superadmin_update',
      table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select private.is_superadmin()))',
      table_name || '_superadmin_delete',
      table_name
    );
  end loop;
end $$;

drop policy organizations_authenticated_brand on public.organizations;
drop policy organizations_member_read on public.organizations;
drop policy organizations_director_update on public.organizations;
drop policy organizations_superadmin_write on public.organizations;

create policy organizations_select on public.organizations
  for select to authenticated
  using (
    brand_completed_at is not null
    or id = (select private.current_organization_id())
    or (select private.is_superadmin())
  );

create policy organizations_insert on public.organizations
  for insert to authenticated
  with check ((select private.is_superadmin()));

create policy organizations_update on public.organizations
  for update to authenticated
  using (
    (select private.is_superadmin())
    or (
      (select private.current_role()) = 'director'
      and id = (select private.current_organization_id())
    )
  )
  with check (
    (select private.is_superadmin())
    or (
      (select private.current_role()) = 'director'
      and id = (select private.current_organization_id())
    )
  );

create policy organizations_delete on public.organizations
  for delete to authenticated
  using ((select private.is_superadmin()));

drop policy profiles_select_own on public.profiles;
drop policy profiles_select_same_org on public.profiles;
drop policy profiles_select_desk on public.profiles;
drop policy profiles_insert_empresario on public.profiles;
drop policy profiles_update_own on public.profiles;
drop policy profiles_superadmin_write on public.profiles;

create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or (select private.is_superadmin())
    or (
      organization_id is not null
      and organization_id = (select private.current_organization_id())
      and (select private.current_role()) in ('director', 'capturista', 'invitador')
    )
    or (
      (select private.current_role()) = 'moderador'
      and exists (
        select 1 from public.passes where passes.profile_id = profiles.id
      )
    )
  );

create policy profiles_insert on public.profiles
  for insert to authenticated
  with check (
    (select private.is_superadmin())
    or (
      id = (select auth.uid())
      and role = 'empresario'
      and organization_id is null
    )
  );

create policy profiles_update on public.profiles
  for update to authenticated
  using (
    (select private.is_superadmin())
    or id = (select auth.uid())
  )
  with check (
    (select private.is_superadmin())
    or (
      id = (select auth.uid())
      and role = (select private.current_role())
      and organization_id is not distinct from (select private.current_organization_id())
    )
  );

create policy profiles_delete on public.profiles
  for delete to authenticated
  using ((select private.is_superadmin()));

drop policy crm_events_cargar on public.crm_events;
drop policy crm_events_follow_up on public.crm_events;
drop policy crm_events_arrival on public.crm_events;

create policy crm_events_insert on public.crm_events
  for insert to authenticated
  with check (
    (
      event = 'cargar'
      and (
        (select private.is_superadmin())
        or exists (
          select 1
          from public.crm_contacts
          where crm_contacts.id = crm_events.contact_id
            and crm_contacts.organization_id = (select private.current_organization_id())
            and (select private.current_role()) in ('director', 'capturista', 'invitador')
        )
      )
    )
    or (
      event in ('contactar', 'rechazar')
      and (
        (select private.is_superadmin())
        or exists (
          select 1
          from public.crm_contacts
          where crm_contacts.id = crm_events.contact_id
            and crm_contacts.organization_id = (select private.current_organization_id())
            and (select private.current_role()) in ('director', 'capturista')
        )
      )
    )
    or (
      event = 'llegar'
      and (select private.current_role()) in ('superadmin', 'moderador')
    )
  );

drop policy media_select on public.media_assets;
drop policy media_logo_write on public.media_assets;
drop policy media_logo_update on public.media_assets;
drop policy media_pass_write on public.media_assets;
drop policy media_content_write on public.media_assets;
drop policy media_superadmin_all on public.media_assets;

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
    or purpose = 'content_image' and (select private.is_superadmin())
  );

create policy media_insert on public.media_assets
  for insert to authenticated
  with check (
    (select private.is_superadmin())
    or (
      purpose = 'organization_logo'
      and uploaded_by = (select auth.uid())
      and organization_id = (select private.current_organization_id())
      and (select private.current_role()) = 'director'
    )
    or (
      purpose = 'pass_qr'
      and profile_id = (select auth.uid())
      and uploaded_by = (select auth.uid())
      and exists (
        select 1
        from public.profiles
        where profiles.id = (select auth.uid())
          and profiles.onboarded_at is not null
      )
    )
  );

create policy media_update on public.media_assets
  for update to authenticated
  using (
    (select private.is_superadmin())
    or (
      purpose = 'organization_logo'
      and organization_id = (select private.current_organization_id())
      and (select private.current_role()) = 'director'
    )
  )
  with check (
    (select private.is_superadmin())
    or (
      purpose = 'organization_logo'
      and organization_id = (select private.current_organization_id())
      and (select private.current_role()) = 'director'
    )
  );

create policy media_delete on public.media_assets
  for delete to authenticated
  using ((select private.is_superadmin()));

drop policy responses_own on public.response_choices;
drop policy responses_panel_read on public.response_choices;

create policy responses_select on public.response_choices
  for select to authenticated
  using (
    profile_id = (select auth.uid())
    or (select private.current_role()) in ('superadmin', 'moderador')
  );

create policy responses_insert on public.response_choices
  for insert to authenticated
  with check (
    (select private.is_superadmin())
    or (
      profile_id = (select auth.uid())
      and (select private.current_role()) = 'empresario'
    )
  );

create policy responses_update on public.response_choices
  for update to authenticated
  using (
    (select private.is_superadmin())
    or profile_id = (select auth.uid())
  )
  with check (
    (select private.is_superadmin())
    or (
      profile_id = (select auth.uid())
      and (select private.current_role()) = 'empresario'
    )
  );

create policy responses_delete on public.response_choices
  for delete to authenticated
  using (
    (select private.is_superadmin())
    or profile_id = (select auth.uid())
  );
