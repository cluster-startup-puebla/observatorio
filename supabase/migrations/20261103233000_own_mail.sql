create unique index outbox_one_event_pass_per_profile_idx
  on public.outbox_messages (profile_id)
  where kind = 'event_pass' and profile_id is not null;

create or replace function public.enqueue_own_mail(mail_kind public.mail_kind)
returns table (id uuid, to_email text, subject text, profile_id uuid, already_sent boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  row_id uuid;
  own_email text;
  own_subject text;
begin
  if mail_kind not in ('welcome', 'event_pass') then
    raise exception 'tipo no permitido';
  end if;
  if auth.uid() is null then
    raise exception 'sin sesión';
  end if;
  select lower(email) into own_email from auth.users where auth.users.id = auth.uid();
  if own_email is null then
    raise exception 'sin correo';
  end if;
  if not exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'empresario'
  ) then
    raise exception 'no es empresario';
  end if;
  if mail_kind = 'event_pass' and not exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.onboarded_at is not null
  ) then
    raise exception 'sin perfil terminado';
  end if;
  own_subject := case mail_kind
    when 'welcome' then 'Tu lugar en el Observatorio ya está apartado'
    else 'Tu pase para la sesión ya está listo'
  end;
  begin
    insert into public.outbox_messages (kind, to_email, subject, profile_id, created_by)
    values (mail_kind, own_email, own_subject, auth.uid(), auth.uid())
    returning outbox_messages.id into row_id;
  exception when unique_violation then
    select messages.id into row_id
    from public.outbox_messages as messages
    where messages.profile_id = auth.uid() and messages.kind = mail_kind
    order by messages.created_at desc
    limit 1;
  end;
  return query
  select messages.id, messages.to_email, messages.subject, messages.profile_id, messages.sent_at is not null
  from public.outbox_messages as messages
  where messages.id = row_id;
end;
$$;

create or replace function public.record_own_mail(
  message_id uuid,
  provider text,
  failure text,
  html text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.outbox_messages
  set provider_id = provider,
      last_error = failure,
      body_html = html,
      sent_at = case when provider is not null and provider <> '' then now() else sent_at end
  where id = message_id
    and profile_id = auth.uid()
    and kind in ('welcome', 'event_pass')
    and sent_at is null;
  if not found then
    raise exception 'no se pudo registrar';
  end if;
end;
$$;

revoke all on function public.enqueue_own_mail(public.mail_kind) from public;
grant execute on function public.enqueue_own_mail(public.mail_kind) to authenticated;

revoke all on function public.record_own_mail(uuid, text, text, text) from public;
grant execute on function public.record_own_mail(uuid, text, text, text) to authenticated;
