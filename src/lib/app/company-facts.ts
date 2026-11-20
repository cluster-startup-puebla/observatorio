import { bandLabel } from "@/lib/admin/empresas/band-label";
import { marketSizes } from "@/lib/onboarding/market-sizes";
import type { CompanyHome } from "./company-score";

export type CompanyFactIcon = "sector" | "users" | "globe" | "pin" | "market";

export type CompanyFact = {
  icon: CompanyFactIcon;
  label: string;
  value: string;
  href?: string;
  wide?: boolean;
};

function clean(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text || null;
}

function named(value: string | null, labelFor: (raw: string) => string | null | undefined) {
  const raw = clean(value);
  if (!raw) return null;
  return clean(labelFor(raw) ?? null) ?? raw;
}

function siteHref(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function fact(icon: CompanyFactIcon, label: string, value: string | null, href?: string): CompanyFact | null {
  if (!value) return null;
  return { icon, label, value, href };
}

export function companyFacts(home: CompanyHome) {
  const website = clean(home.website);
  const rows = [
    fact("users", "Tamaño", named(home.employeeBand, bandLabel)),
    fact("pin", "Municipio", clean(home.municipality)),
    fact("sector", "Sector", clean(home.sectorName)),
    fact("market", "Mercado", named(home.marketSize, (raw) => marketSizes.find((item) => item.value === raw)?.label)),
    fact("globe", "Sitio web", website, website ? siteHref(website) : undefined),
  ];
  return rows.flatMap((row) => (row ? [row] : []));
}
