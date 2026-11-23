export function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export type RsvpEmbed = {
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  profile_id: string | null;
  sector_id: string | null;
  profiles: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null;
  companies:
    | {
        legal_name: string | null;
        sector_id: string | null;
        sectors: { name: string | null } | { name: string | null }[] | null;
      }
    | {
        legal_name: string | null;
        sector_id: string | null;
        sectors: { name: string | null } | { name: string | null }[] | null;
      }[]
    | null;
  sectors: { name: string | null } | { name: string | null }[] | null;
};

export type CompanyFace = { name: string; sectorId: string; sector: string };
