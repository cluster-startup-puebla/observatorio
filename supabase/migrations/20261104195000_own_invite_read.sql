create policy crm_contacts_own_email_read on public.crm_contacts
  for select to authenticated
  using (
    email = (
      select lower(profiles.email)
      from public.profiles
      where profiles.id = (select auth.uid())
    )
  );

create policy crm_events_own_contact_read on public.crm_events
  for select to authenticated
  using (
    exists (
      select 1
      from public.crm_contacts
      where crm_contacts.id = crm_events.contact_id
        and crm_contacts.email = (
          select lower(profiles.email)
          from public.profiles
          where profiles.id = (select auth.uid())
        )
    )
  );
