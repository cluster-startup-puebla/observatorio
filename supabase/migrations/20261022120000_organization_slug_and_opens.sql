alter table public.organizations
  add column slug text;

alter table public.organizations
  add constraint organizations_slug_shape
  check (slug is null or slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');

create unique index organizations_slug_idx
  on public.organizations (slug)
  where slug is not null;

create table public.link_opens (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  sector_id uuid not null references public.sectors (id),
  opened_at timestamptz not null default now()
);

create index link_opens_org_opened_idx
  on public.link_opens (organization_id, opened_at desc);

alter table public.link_opens enable row level security;
alter table public.link_opens force row level security;

create policy link_opens_select on public.link_opens
  for select to authenticated
  using (
    organization_id = (select private.current_organization_id())
    or (select private.is_superadmin())
  );

create or replace function public.record_link_open(org_id uuid, sector_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  sector uuid;
begin
  select id into sector from public.sectors where slug = sector_slug;
  if sector is null then
    return;
  end if;
  if not exists (
    select 1 from public.organizations
    where id = org_id and brand_completed_at is not null
  ) then
    return;
  end if;
  insert into public.link_opens (organization_id, sector_id)
  values (org_id, sector);
end;
$$;

revoke all on function public.record_link_open(uuid, text) from public;
grant execute on function public.record_link_open(uuid, text) to anon, authenticated;

-- org_id first so the client can upload to organization-logos/{org_id}/logo.* after promote
create or replace function public.finish_organization_brand(
  org_id uuid,
  org_name text,
  org_slug text,
  org_color text,
  logo_path text,
  logo_type text,
  logo_bytes integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select private.current_role()) <> 'empresario' then
    raise exception 'la cuenta ya tiene organismo';
  end if;
  if exists (select 1 from public.sectors where slug = org_slug) then
    raise exception 'ese enlace es de un sector';
  end if;
  if exists (select 1 from public.organizations where slug = org_slug) then
    raise exception 'ese enlace ya existe';
  end if;

  insert into public.organizations (id, name, slug, brand_color, brand_completed_at)
  values (org_id, org_name, org_slug, org_color, null);

  insert into public.media_assets (
    purpose, bucket_id, object_path, content_type, byte_size, organization_id
  ) values (
    'organization_logo', 'organization-logos', logo_path, logo_type, logo_bytes, org_id
  );

  update public.organizations
  set brand_completed_at = now()
  where id = org_id;

  update public.profiles
  set role = 'director',
      organization_id = org_id,
      onboarded_at = now()
  where id = auth.uid();
end;
$$;

revoke all on function public.finish_organization_brand(uuid, text, text, text, text, text, integer) from public;
grant execute on function public.finish_organization_brand(uuid, text, text, text, text, text, integer) to authenticated;

create or replace function public.organization_by_slug(org_slug text)
returns table (id uuid, name text, slug text)
language sql
stable
security definer
set search_path = public
as $$
  select o.id, o.name, o.slug
  from public.organizations o
  where o.slug = org_slug
    and o.brand_completed_at is not null
  limit 1;
$$;

revoke all on function public.organization_by_slug(text) from public;
grant execute on function public.organization_by_slug(text) to anon, authenticated;
