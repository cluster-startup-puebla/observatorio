type Named = { name?: string } | { name?: string }[] | null;
type Owner = { email?: string } | { email?: string }[] | null;

export function convenerLabel(names: string[]) {
  const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  unique.sort((left, right) => left.localeCompare(right, "es"));
  return unique.length ? unique.join(", ") : "—";
}

export function ownerEmail(owner: Owner) {
  const info = Array.isArray(owner) ? owner[0] : owner;
  return String(info?.email ?? "").trim().toLowerCase();
}

export function organizationName(org: Named) {
  const info = Array.isArray(org) ? org[0] : org;
  return info?.name ?? "";
}

export function statusByEmail(rows: { email: string; status: string | null }[]) {
  const grouped = new Map<string, string[]>();
  for (const row of rows) {
    const email = row.email.trim().toLowerCase();
    if (!email || !row.status) continue;
    const list = grouped.get(email) ?? [];
    list.push(row.status);
    grouped.set(email, list);
  }
  return grouped;
}

export function convenerHrefs(contacts: { email: string; name: string; id: string }[]) {
  const grouped = new Map<string, { name: string; href: string }[]>();
  for (const contact of contacts) {
    const email = contact.email.trim().toLowerCase();
    const name = contact.name.trim();
    if (!email || !name || !contact.id) continue;
    const href = `/admin/organismos/${contact.id}`;
    const list = grouped.get(email) ?? [];
    if (list.some((item) => item.href === href)) continue;
    list.push({ name, href });
    grouped.set(email, list);
  }
  return new Map(
    [...grouped].map(([email, list]) => {
      list.sort((left, right) => left.name.localeCompare(right.name, "es"));
      return [email, JSON.stringify(list)] as const;
    }),
  );
}

export function convenerByEmail(contacts: { email: string; name: string }[]) {
  const grouped = new Map<string, string[]>();
  for (const contact of contacts) {
    const email = contact.email.trim().toLowerCase();
    if (!email) continue;
    const names = grouped.get(email) ?? [];
    names.push(contact.name);
    grouped.set(email, names);
  }
  return new Map([...grouped].map(([email, names]) => [email, convenerLabel(names)]));
}
