drop function public.organization_by_slug(text);

create function public.organization_by_slug(org_slug text)
returns table (id uuid, name text, slug text, brand_color text)
language sql
stable
security definer
set search_path = public
as $$
  select o.id, o.name, o.slug, o.brand_color
  from public.organizations o
  where o.slug = org_slug
    and o.brand_completed_at is not null
  limit 1;
$$;

revoke all on function public.organization_by_slug(text) from public;
grant execute on function public.organization_by_slug(text) to anon, authenticated;
