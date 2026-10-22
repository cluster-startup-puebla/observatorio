create or replace function public.create_organization_brand(
  org_id uuid,
  org_name text,
  org_color text,
  logo_path text,
  logo_type text,
  logo_bytes integer
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.organizations (id, name, brand_color, brand_completed_at)
  values (org_id, org_name, org_color, null);

  insert into public.media_assets (
    purpose, bucket_id, object_path, content_type, byte_size, organization_id
  ) values (
    'organization_logo', 'organization-logos', logo_path, logo_type, logo_bytes, org_id
  );

  update public.organizations
  set brand_completed_at = now()
  where id = org_id;
end;
$$;

revoke all on function public.create_organization_brand(uuid, text, text, text, text, integer) from public;
grant execute on function public.create_organization_brand(uuid, text, text, text, text, integer) to authenticated;
