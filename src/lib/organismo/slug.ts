import { sectorSlug } from "@/lib/sectors";

export function orgSlug(name: string, explicit: string) {
  const raw = explicit.trim() || name.trim();
  return sectorSlug(raw);
}

export function slugError(slug: string, sectorSlugs: readonly string[]) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length < 2) return "slug inválido";
  if (sectorSlugs.includes(slug)) return "ese enlace es de un sector";
  return null;
}
