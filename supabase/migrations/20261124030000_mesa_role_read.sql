-- Mesa (moderador/superadmin): leer RSVP/pases y registrar llegada sin depender de RPC+auth.uid.
create policy session_rsvps_mesa_read on public.session_rsvps
  for select to authenticated
  using (
    (select private.current_role()) in (
      'superadmin'::public.account_role,
      'moderador'::public.account_role
    )
  );

create policy rsvp_passes_mesa_read on public.rsvp_passes
  for select to authenticated
  using (
    (select private.current_role()) in (
      'superadmin'::public.account_role,
      'moderador'::public.account_role
    )
  );

notify pgrst, 'reload schema';
