create or replace function public.organization_has_public_logo(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organizations
    where id::text = split_part(object_name, '/', 1)
      and brand_completed_at is not null
  );
$$;

revoke all on function public.organization_has_public_logo(text) from public;
grant execute on function public.organization_has_public_logo(text) to anon, authenticated;

create policy storage_logo_public_read on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'organization-logos'
    and public.organization_has_public_logo(name)
  );

create or replace function public.organization_invite_brand(org_id uuid)
returns table (name text, logo_path text)
language sql
stable
security definer
set search_path = public
as $$
  select o.name, m.object_path
  from public.organizations o
  left join public.media_assets m
    on m.organization_id = o.id
    and m.purpose = 'organization_logo'
  where o.id = org_id
    and o.brand_completed_at is not null
  limit 1;
$$;

revoke all on function public.organization_invite_brand(uuid) from public;
grant execute on function public.organization_invite_brand(uuid) to anon, authenticated;
