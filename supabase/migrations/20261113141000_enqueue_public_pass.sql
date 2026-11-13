create or replace function public.enqueue_public_pass(guest_id uuid)
returns table (id uuid, to_email text, subject text, profile_id uuid, already_sent boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  guest text;
  ready timestamptz;
  row_id uuid;
begin
  if auth.uid() is null or not (select private.is_superadmin()) then
    raise exception 'sin sesión';
  end if;
  select email, onboarded_at into guest, ready
  from public.profiles
  where profiles.id = enqueue_public_pass.guest_id
    and profiles.role = 'empresario';
  if guest is null or ready is null then
    raise exception 'sin perfil';
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

revoke all on function public.enqueue_public_pass(uuid) from public, anon;
grant execute on function public.enqueue_public_pass(uuid) to authenticated;
