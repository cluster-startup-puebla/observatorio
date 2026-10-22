create policy crm_contacts_superadmin_delete on public.crm_contacts
  for delete to authenticated
  using ((select private.is_superadmin()));

create policy passes_superadmin_delete on public.passes
  for delete to authenticated
  using ((select private.is_superadmin()));

create policy arrivals_superadmin_delete on public.arrivals
  for delete to authenticated
  using ((select private.is_superadmin()));
