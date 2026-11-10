create or replace function public.enqueue_accepted_pass(contact_id uuid)
returns table (id uuid, to_email text, subject text, profile_id uuid, already_sent boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  org uuid;
  src text;
  guest text;
  current_status text;
  guest_id uuid;
  row_id uuid;
begin
  if auth.uid() is null then
    raise exception 'sin sesión';
  end if;
  select organization_id, source, email into org, src, guest
  from public.crm_contacts
  where crm_contacts.id = enqueue_accepted_pass.contact_id;
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
    raise exception 'no puedes enviar este pase';
  end if;
  select status into current_status
  from public.crm_contact_status
  where crm_contact_status.contact_id = enqueue_accepted_pass.contact_id;
  if current_status not in ('confirmo', 'registrado', 'llego') then
    raise exception 'el enlace no está aceptado';
  end if;
  select profiles.id into guest_id
  from public.profiles
  where lower(profiles.email) = guest
    and profiles.role = 'empresario'
    and profiles.onboarded_at is not null;
  if guest_id is null then
    return;
  end if;
  begin
    insert into public.outbox_messages (kind, to_email, subject, profile_id, created_by)
    values ('event_pass', guest, 'Tu pase para la sesión ya está listo', guest_id, auth.uid())
    returning outbox_messages.id into row_id;
  exception when unique_violation then
    select messages.id into row_id
    from public.outbox_messages as messages
    where messages.profile_id = guest_id and messages.kind = 'event_pass'
    order by messages.created_at desc
    limit 1;
  end;
  return query
  select messages.id, messages.to_email, messages.subject, messages.profile_id, messages.sent_at is not null
  from public.outbox_messages as messages
  where messages.id = row_id;
end;
$$;

create or replace function public.record_accepted_pass(message_id uuid, provider text, failure text, html text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  guest uuid;
  org uuid;
begin
  if auth.uid() is null then
    raise exception 'sin sesión';
  end if;
  select profile_id into guest
  from public.outbox_messages
  where id = message_id and kind = 'event_pass' and sent_at is null;
  if guest is null then
    raise exception 'no se pudo registrar';
  end if;
  select organization_id into org
  from public.crm_contacts
  where lower(email) = (select lower(email) from public.profiles where id = guest)
    and source = 'enlace'
  limit 1;
  if org is null then
    raise exception 'no se pudo registrar';
  end if;
  if not (
    (select private.is_superadmin())
    or (
      org = (select private.current_organization_id())
      and (select private.current_role()) in ('director', 'capturista')
    )
  ) then
    raise exception 'no se pudo registrar';
  end if;
  update public.outbox_messages
  set provider_id = provider,
      last_error = failure,
      body_html = html,
      sent_at = case when provider is not null and provider <> '' then now() else sent_at end
  where id = message_id
    and kind = 'event_pass'
    and sent_at is null;
end;
$$;

revoke all on function public.enqueue_accepted_pass(uuid) from public;
grant execute on function public.enqueue_accepted_pass(uuid) to authenticated;

revoke all on function public.record_accepted_pass(uuid, text, text, text) from public;
grant execute on function public.record_accepted_pass(uuid, text, text, text) to authenticated;
