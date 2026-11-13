create policy public_registrations_superadmin_select
on public.public_registrations
for select
to authenticated
using ((select private.is_superadmin()));
