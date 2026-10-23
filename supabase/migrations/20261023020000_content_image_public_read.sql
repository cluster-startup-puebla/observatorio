create or replace function public.content_image_object_is_public(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.media_assets
    where purpose = 'content_image'
      and bucket_id = 'content-images'
      and object_path = object_name
  );
$$;

revoke all on function public.content_image_object_is_public(text) from public;
grant execute on function public.content_image_object_is_public(text) to anon, authenticated;

create or replace function public.content_image_file(asset_id uuid)
returns table (purpose text, bucket_id text, object_path text, content_type text)
language sql
stable
security definer
set search_path = public
as $$
  select m.purpose::text, m.bucket_id, m.object_path, m.content_type
  from public.media_assets m
  where m.id = asset_id
    and m.purpose = 'content_image'
    and m.bucket_id = 'content-images';
$$;

revoke all on function public.content_image_file(uuid) from public;
grant execute on function public.content_image_file(uuid) to anon, authenticated;

drop policy if exists storage_content_public_read on storage.objects;
create policy storage_content_public_read on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'content-images'
    and public.content_image_object_is_public(name)
  );
