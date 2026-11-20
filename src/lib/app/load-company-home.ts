import "server-only";

import { mexicoDay } from "@/lib/admin/tablero/pace-bars";
import { readSessionAccount } from "@/lib/auth/session-account";
import { loadSectorSessions } from "@/lib/app/load-sector-sessions";
import { nextForSector } from "@/lib/app/sector-sessions";
import { companyHasLogo } from "@/lib/onboarding/company-has-logo";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";
import { companyActions } from "./company-actions";
import { companyResult } from "./company-result";
import { convenerLogoUrl } from "./convener-logo";
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

  const sector = sectorOf(row.sectors);
  const [hasLogo, run, sessions, logo, convener] = await Promise.all([
    companyHasLogo(token, account.id),
    db.from("methodology_v2_runs").select("phase, score, answers, instrument_id, finished_at").eq("profile_id", account.id).maybeSingle(),
    loadSectorSessions(token, row.sector_id),
    db.from("media_assets").select("object_path").eq("profile_id", account.id).eq("purpose", "company_logo").maybeSingle(),
    convenerLogoUrl(db, account.email, sector.slug),
  ]);
  if (run.error) throw new Error(run.error.message);

  const score = companyScore(run.data);
  const result = await companyResult(run.data);
  const path = typeof logo.data?.object_path === "string" ? logo.data.object_path.trim() : "";
  const signed = path ? await db.storage.from("company-logos").createSignedUrl(path, 60 * 60 * 24) : null;
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
    logoUrl: signed?.data?.signedUrl ?? null,
    convenerLogoUrl: convener,
    score,
    result,
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
