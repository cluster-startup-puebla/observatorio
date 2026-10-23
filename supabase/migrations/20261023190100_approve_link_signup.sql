create or replace function public.approve_link_signup(contact_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  org uuid;
  src text;
  current_status text;
begin
  if auth.uid() is null then
    raise exception 'sin sesión';
  end if;
  select organization_id, source into org, src
  from public.crm_contacts
  where id = contact_id;
  if org is null or src is distinct from 'enlace' then
    raise exception 'no es un registro por enlace';
  end if;
  if not (
    (select private.is_superadmin())
    or (
      org = (select private.current_organization_id())
      and (select private.current_role()) in ('director', 'capturista')
    )
  ) then
    raise exception 'no puedes aceptar esta invitación';
  end if;
  select status into current_status
  from public.crm_contact_status
  where crm_contact_status.contact_id = approve_link_signup.contact_id;
  if current_status is distinct from 'cargado' then
    raise exception 'ya no está pendiente';
  end if;
  insert into public.crm_events (contact_id, event, actor_id, occurred_at)
  values (contact_id, 'confirmar', auth.uid(), clock_timestamp());
  insert into public.crm_events (contact_id, event, actor_id, occurred_at)
  values (contact_id, 'registrar', auth.uid(), clock_timestamp() + interval '1 millisecond');
end;
$$;

revoke all on function public.approve_link_signup(uuid) from public;
grant execute on function public.approve_link_signup(uuid) to authenticated;
