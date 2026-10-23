alter table public.companies
  add column show_logo_on_event boolean not null default false;

comment on column public.companies.show_logo_on_event is
  'La empresa aceptó mostrar su logo el día del evento. El archivo está en media_assets company_logo.';

alter table public.media_assets
  drop constraint media_bucket_matches_purpose;

alter table public.media_assets
  add constraint media_bucket_matches_purpose check (
    (
      purpose = 'organization_logo'
      and bucket_id = 'organization-logos'
      and organization_id is not null
      and profile_id is null
      and content_block_slug is null
      and object_path in (
        organization_id::text || '/logo.png',
        organization_id::text || '/logo.jpg',
        organization_id::text || '/logo.jpeg',
        organization_id::text || '/logo.webp'
      )
      and content_type in ('image/png', 'image/jpeg', 'image/webp')
      and byte_size <= 2097152
    )
    or (
      purpose = 'pass_qr'
      and bucket_id = 'pass-images'
      and profile_id is not null
      and organization_id is null
      and content_block_slug is null
      and object_path = profile_id::text || '/pass.png'
      and content_type = 'image/png'
      and byte_size <= 524288
    )
    or (
      purpose = 'content_image'
      and bucket_id = 'content-images'
      and content_block_slug is not null
      and organization_id is null
      and profile_id is null
      and object_path like content_block_slug || '/%'
      and content_type in ('image/png', 'image/jpeg', 'image/webp')
      and byte_size <= 4194304
    )
    or (
      purpose = 'company_logo'
      and bucket_id = 'company-logos'
      and profile_id is not null
      and organization_id is null
      and content_block_slug is null
      and object_path in (
        profile_id::text || '/logo.png',
        profile_id::text || '/logo.jpg',
        profile_id::text || '/logo.webp'
      )
      and content_type in ('image/png', 'image/jpeg', 'image/webp')
      and byte_size <= 2097152
    )
  );

create unique index media_one_company_logo_per_profile_idx
  on public.media_assets (profile_id)
  where purpose = 'company_logo';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'company-logos',
  'company-logos',
  false,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.company_logo_is_public(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.companies c
    join public.media_assets m on m.profile_id = c.profile_id
    where c.profile_id::text = split_part(object_name, '/', 1)
      and c.show_logo_on_event
      and m.purpose = 'company_logo'
      and m.object_path = object_name
  );
$$;

revoke all on function public.company_logo_is_public(text) from public;
grant execute on function public.company_logo_is_public(text) to anon, authenticated;

create policy storage_company_logo_owner_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and private.current_role() = 'empresario'
  );

create policy storage_company_logo_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and private.current_role() = 'empresario'
  );

create policy storage_company_logo_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and private.current_role() = 'empresario'
  )
  with check (
    bucket_id = 'company-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and private.current_role() = 'empresario'
  );

create policy storage_company_logo_superadmin_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'company-logos'
    and private.is_superadmin()
  );

create policy storage_company_logo_public_read on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'company-logos'
    and public.company_logo_is_public(name)
  );

drop policy media_insert on public.media_assets;
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
    or (
      purpose = 'company_logo'
      and profile_id = (select auth.uid())
      and uploaded_by = (select auth.uid())
      and (select private.current_role()) = 'empresario'
    )
  );

drop policy media_update on public.media_assets;
create policy media_update on public.media_assets
  for update to authenticated
  using (
    (select private.is_superadmin())
    or (
      purpose = 'organization_logo'
      and organization_id = (select private.current_organization_id())
      and (select private.current_role()) = 'director'
    )
    or (
      purpose = 'company_logo'
      and profile_id = (select auth.uid())
      and (select private.current_role()) = 'empresario'
    )
  )
  with check (
    (select private.is_superadmin())
    or (
      purpose = 'organization_logo'
      and organization_id = (select private.current_organization_id())
      and (select private.current_role()) = 'director'
    )
    or (
      purpose = 'company_logo'
      and profile_id = (select auth.uid())
      and (select private.current_role()) = 'empresario'
    )
  );
