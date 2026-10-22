import { diagnosticIndustries } from "@/content/diagnostico-tmec";

export function sectorSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const keptSlug: Record<string, string> = {
  "Plásticos y Economía circular": "plasticos-y-hule",
};

export const sectors = diagnosticIndustries.map((name) => ({
  name,
  slug: keptSlug[name] ?? sectorSlug(name),
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

export function acceptedIndustry(value: string) {
  const text = value.trim();
  if (text.length < 2 || text.length > 80) return null;
  const known = sectors.find(
    (sector) => sector.slug === text || sector.name.toLowerCase() === text.toLowerCase(),
  );
  return known?.slug ?? text;
}

export function reserveHref(pathname: string, token?: string | null): string {
  const slug = pathname.split("/").filter(Boolean)[0] ?? "";
  const resolved = resolveSector({ pathSector: slug });
  if (!resolved.slug) return "/register";
  const query = new URLSearchParams({ sector: resolved.slug });
  if (token) query.set("invitacion", token);
  return `/register?${query.toString()}`;
}
