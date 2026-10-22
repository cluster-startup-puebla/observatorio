create or replace function public.attribute_link_signup(
  org_id uuid,
  sector_slug text,
  guest_email text,
  guest_name text,
  guest_company text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  sector uuid;
  contact uuid;
  normalized text;
  label text;
  company text;
begin
  if auth.uid() is null then
    return;
  end if;
  normalized := lower(trim(guest_email));
  if normalized !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    return;
  end if;
  if (select lower(email) from public.profiles where id = auth.uid()) is distinct from normalized then
    return;
  end if;
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
  if exists (
    select 1 from public.crm_contacts
    where organization_id = org_id and email = normalized
  ) then
    return;
  end if;
  label := trim(guest_name);
  if char_length(label) < 2 then
    label := split_part(normalized, '@', 1);
  end if;
  company := trim(guest_company);
  if char_length(company) < 2 then
    company := 'Por confirmar';
  end if;
  insert into public.crm_contacts (organization_id, sector_id, nombre, empresa, email, source)
  values (org_id, sector, left(label, 120), left(company, 160), normalized, 'enlace')
  returning id into contact;
  insert into public.crm_events (contact_id, event, actor_id, occurred_at)
  values (contact, 'cargar', auth.uid(), clock_timestamp());
  insert into public.crm_events (contact_id, event, actor_id, occurred_at)
  values (contact, 'confirmar', auth.uid(), clock_timestamp() + interval '1 millisecond');
  insert into public.crm_events (contact_id, event, actor_id, occurred_at)
  values (contact, 'registrar', auth.uid(), clock_timestamp() + interval '2 milliseconds');
end;
$$;

revoke all on function public.attribute_link_signup(uuid, text, text, text, text) from public;
grant execute on function public.attribute_link_signup(uuid, text, text, text, text) to authenticated;
