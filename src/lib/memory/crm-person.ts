import type { CrmPerson } from "../directory";
import type { MemoryStore, Person } from "./store";

function accountFor(people: Person[], email: string) {
  const normalized = email.trim().toLowerCase();
  return people.find((item) => !item.orgId && item.email.trim().toLowerCase() === normalized);
}

function sectorFromStamp(state: MemoryStore, orgId: string, email: string) {
  const prefix = `${orgId}:`;
  const stamp = (state.attributed ?? []).find(
    (item) => item.startsWith(prefix) && item.endsWith(`:${email}`),
  );
  if (!stamp) return "";
  return stamp.slice(prefix.length, stamp.length - email.length - 1);
}

export function crmPerson(state: MemoryStore, person: Person): CrmPerson {
  const account = accountFor(state.people, person.email);
  const email = person.email.trim().toLowerCase();
  return {
    id: person.id,
    nombre: person.name || account?.name || "",
    empresa: person.empresa || account?.empresa || "",
    correo: person.email,
    status: person.status ?? "",
    sector: person.sectorSlug || account?.sectorSlug || sectorFromStamp(state, person.orgId ?? "", email),
  };
}
