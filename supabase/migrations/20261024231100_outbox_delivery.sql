alter table public.outbox_messages
  add column session_id uuid references public.sessions (id),
  add column body_html text,
  add column sent_at timestamptz,
  add column provider_id text,
  add column last_error text;

alter table public.outbox_messages
  drop constraint if exists outbox_session_for_broadcast;

alter table public.outbox_messages
  add constraint outbox_session_for_broadcast check (
    kind not in ('reminder', 'thanks')
    or session_id is not null
  );

comment on column public.outbox_messages.session_id is
  'Sesión del recordatorio, del pase o del gracias. La bienvenida y la innovación abierta pueden ir sin sesión.';

comment on column public.outbox_messages.body_html is
  'HTML que se mandó. Se llena al enviar, para ver el correo aunque la plantilla cambie.';

comment on column public.outbox_messages.sent_at is
  'Vacío: pendiente. Con fecha: Resend aceptó el envío.';

comment on column public.outbox_messages.provider_id is
  'Id que devolvió Resend. Sirve para no mandar dos veces la misma fila.';

comment on column public.outbox_messages.last_error is
  'Último fallo de envío. La fila sigue pendiente.';

create index outbox_messages_pending_idx
  on public.outbox_messages (created_at)
  where sent_at is null;

create unique index outbox_one_welcome_per_profile_idx
  on public.outbox_messages (profile_id)
  where kind = 'welcome' and profile_id is not null;

create unique index outbox_one_kind_per_profile_session_idx
  on public.outbox_messages (kind, profile_id, session_id)
  where kind in ('event_pass', 'reminder', 'thanks')
    and profile_id is not null
    and session_id is not null;

create table public.outbox_attempts (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.outbox_messages (id) on delete cascade,
  attempted_at timestamptz not null default now(),
  provider_id text,
  error text,
  constraint outbox_attempts_result check (provider_id is not null or error is not null)
);

comment on table public.outbox_attempts is
  'Cada intento de envío. El mensaje guarda el último resultado. Aquí queda el historial.';

create index outbox_attempts_message_idx
  on public.outbox_attempts (message_id, attempted_at desc);

alter table public.outbox_attempts enable row level security;
alter table public.outbox_attempts force row level security;

create policy outbox_attempts_superadmin_read on public.outbox_attempts
  for select to authenticated
  using ((select private.is_superadmin()));

grant select on public.outbox_attempts to authenticated;
