create or replace function public.event_logos()
returns table (profile_id uuid, legal_name text, object_path text)
language sql
stable
security definer
set search_path = public
as $$
  select c.profile_id, c.legal_name, m.object_path
  from public.companies c
  join public.media_assets m on m.profile_id = c.profile_id
  where c.show_logo_on_event
    and m.purpose = 'company_logo'
    and m.object_path is not null
  order by c.legal_name;
$$;

revoke all on function public.event_logos() from public;
grant execute on function public.event_logos() to anon, authenticated;

create or replace function public.event_logo_path(target uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select m.object_path
  from public.companies c
  join public.media_assets m on m.profile_id = c.profile_id
  where c.profile_id = target
    and c.show_logo_on_event
    and m.purpose = 'company_logo'
  limit 1;
$$;

revoke all on function public.event_logo_path(uuid) from public;
grant execute on function public.event_logo_path(uuid) to anon, authenticated;
