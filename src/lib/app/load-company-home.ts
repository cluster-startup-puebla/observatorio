import "server-only";

import { mexicoDay } from "@/lib/admin/tablero/pace-bars";
import { readSessionAccount } from "@/lib/auth/session-account";
import { loadSectorSessions } from "@/lib/app/load-sector-sessions";
import { nextForSector } from "@/lib/app/sector-sessions";
import { companyHasLogo } from "@/lib/onboarding/company-has-logo";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";
import { companyActions } from "./company-actions";
import { companyGaps, companyScore, emptyCompanyHome, sectorOf, type CompanyHome } from "./company-score";
import { sectorHasPackFor, showFirstEvaluation } from "./evaluation-banner";

const columns =
  "legal_name, sector_id, employee_band, referral_source, market_size, municipality, session_interest, website, sectors(name, slug)";

type CompanyRow = {
  legal_name: string;
  sector_id: string;
  employee_band: string;
  referral_source: string | null;
  market_size: string | null;
  municipality: string | null;
  session_interest: string | null;
  website: string | null;
  sectors: unknown;
};

export type { CompanyHome } from "./company-score";

export async function loadCompanyHome(): Promise<CompanyHome> {
  const account = await readSessionAccount();
  const token = await readAccessToken();
  if (!account || !token) return emptyCompanyHome;
  const db = createSupabaseWithAccess(token);
  const company = await db.from("companies").select(columns).eq("profile_id", account.id).maybeSingle();
  if (company.error) throw new Error(company.error.message);
  const row = company.data as CompanyRow | null;
  if (!row) return emptyCompanyHome;

  const [hasLogo, run, sessions] = await Promise.all([
    companyHasLogo(token, account.id),
    db.from("methodology_v2_runs").select("phase, score").eq("profile_id", account.id).maybeSingle(),
    loadSectorSessions(token, row.sector_id),
  ]);
  if (run.error) throw new Error(run.error.message);

  const sector = sectorOf(row.sectors);
  const score = companyScore(run.data);
  const next = nextForSector(sessions, mexicoDay(new Date()));
  return {
    legalName: row.legal_name,
    sectorName: sector.name,
    employeeBand: row.employee_band,
    website: row.website,
    municipality: row.municipality,
    marketSize: row.market_size,
    referral: row.referral_source,
    sessionInterest: row.session_interest,
    score,
    actions: companyActions({
      gaps: companyGaps(hasLogo, row.website),
      showEvaluation: showFirstEvaluation({
        sectorHasPack: sectorHasPackFor(sector.slug),
        finished: score !== null,
      }),
      sessionHref: next ? `/app/sesiones/${next.publicSlug}` : null,
    }),
  };
}
