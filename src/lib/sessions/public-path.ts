import { sectorSlug } from "@/lib/sectors";

export function sessionPublicSlug(sessionOn: string, title: string) {
  const [year, month, day] = sessionOn.split("-");
  return `${day}-${month}-${year.slice(2)}-${sectorSlug(title)}`;
}

export function sessionPath(publicSlug: string) {
  return `/sesiones/${publicSlug}`;
}

export function sessionPiecePath(publicSlug: string, piece: string) {
  return `/sesiones/${publicSlug}/${piece}`;
}
