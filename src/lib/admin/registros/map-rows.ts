type SessionEmbed = { title?: string | null; session_on?: string | null; public_slug?: string | null };

export type RegistroSource = {
  id?: string | null;
  full_name?: string | null;
  company_name?: string | null;
  email?: string | null;
  sector_slug?: string | null;
  referral_source?: string | null;
  completed_at?: string | null;
  poured_at?: string | null;
  poured_profile_id?: string | null;
  session_id?: string | null;
  sessions?: SessionEmbed | SessionEmbed[] | null;
};

export type RegistroRow = Record<string, string>;

function one<T>(value: T | T[] | null | undefined) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function mapRegistroRows(rows: RegistroSource[], companies: Map<string, string>): RegistroRow[] {
  return rows.map((row) => {
    const session = one(row.sessions);
    return {
      id: row.id ?? "",
      full_name: row.full_name ?? "",
      company_name: row.company_name ?? "",
      email: row.email ?? "",
      sector_slug: row.sector_slug ?? "",
      referral_source: row.referral_source ?? "",
      completed_at: row.completed_at ?? "",
      poured_at: row.poured_at ?? "",
      profile_id: row.poured_profile_id ?? "",
      company_id: companies.get(row.poured_profile_id ?? "") ?? "",
      session_id: row.session_id ?? "",
      session_title: session?.title ?? "",
    };
  });
}
