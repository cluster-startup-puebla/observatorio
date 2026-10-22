export function attachStatus(
  contacts: { id: string; email: string }[],
  events: { contact_id: string; status: string }[],
) {
  const byContact = new Map(events.map((event) => [event.contact_id, event.status]));
  return contacts.map((contact) => ({
    id: contact.id,
    email: contact.email,
    status: byContact.get(contact.id) ?? "",
  }));
}
