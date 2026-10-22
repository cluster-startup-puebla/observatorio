import type { CrmPerson } from "@/lib/directory";

export type ContactRow = {
  id: string;
  nombre: string;
  empresa: string;
  email: string;
  sectors: { slug: string } | { slug: string }[] | null;
};

export type StatusRow = { contact_id: string; status: string | null };

function sectorSlug(sectors: ContactRow["sectors"]) {
  if (!sectors) return "";
  return Array.isArray(sectors) ? (sectors[0]?.slug ?? "") : sectors.slug;
}

export function toCrmPeople(contacts: ContactRow[], statuses: StatusRow[]): CrmPerson[] {
  const byContact = new Map(statuses.map((row) => [row.contact_id, row.status ?? ""]));
  return contacts.map((row) => ({
    id: row.id,
    nombre: row.nombre,
    empresa: row.empresa,
    correo: row.email,
    status: byContact.get(row.id) ?? "",
    sector: sectorSlug(row.sectors),
  }));
}
