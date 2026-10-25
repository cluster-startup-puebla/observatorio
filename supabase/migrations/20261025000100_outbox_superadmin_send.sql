create policy outbox_superadmin_insert on public.outbox_messages
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (select private.is_superadmin())
  );

create policy outbox_superadmin_update on public.outbox_messages
  for update to authenticated
  using ((select private.is_superadmin()))
  with check ((select private.is_superadmin()));

create policy outbox_attempts_superadmin_insert on public.outbox_attempts
  for insert to authenticated
  with check ((select private.is_superadmin()));

grant insert on public.outbox_attempts to authenticated;
