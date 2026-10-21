import { diagnosticIndustries } from "@/content/diagnostico-tmec";

export function sectorSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const sectors = diagnosticIndustries.map((name) => ({
  name,
  slug: sectorSlug(name),
}));

export function resolveSector(input: { pathSector?: string; chosen?: string }): {
  slug: string | null;
  name: string | null;
  locked: boolean;
} {
  const fromPath = sectors.find((sector) => sector.slug === input.pathSector);
  if (input.pathSector) {
    return fromPath
      ? { slug: fromPath.slug, name: fromPath.name, locked: true }
      : { slug: null, name: null, locked: false };
  }
  const chosen = sectors.find((sector) => sector.slug === input.chosen);
  return chosen
    ? { slug: chosen.slug, name: chosen.name, locked: false }
    : { slug: null, name: null, locked: false };
}

export function reserveHref(pathname: string): string {
  const slug = pathname.split("/").filter(Boolean)[0] ?? "";
  const resolved = resolveSector({ pathSector: slug });
  return resolved.slug ? `/register?sector=${resolved.slug}` : "/register";
}
