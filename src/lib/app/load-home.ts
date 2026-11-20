import "server-only";

import { readSessionAccount } from "@/lib/auth/session-account";
import type { ProfileGap } from "@/lib/home/profile-gaps";
import { loadProfileGaps } from "@/lib/home/load-profile-gaps";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";
import { companyScore, sectorOf } from "./company-score";
import { sectorHasPackFor, showFirstEvaluation } from "./evaluation-banner";
import { loadSectorSessions } from "./load-sector-sessions";
import { nextForSector, type SectorSession } from "./sector-sessions";

export type HomeScreen = {
  name: string;
  email: string;
  companyId: string | null;
  gaps: ProfileGap[];
  next: SectorSession | null;
  showEvaluation: boolean;
  showInnovation: boolean;
  sectorName: string;
};

const empty: HomeScreen = {
  name: "",
  email: "",
  companyId: null,
  gaps: [],
  next: null,
  showEvaluation: false,
  showInnovation: false,
  sectorName: "",
};

function mexicoToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

export async function loadHome(): Promise<HomeScreen> {
  const account = await readSessionAccount();
  const token = await readAccessToken();
  if (!account || !token) return empty;
  const db = createSupabaseWithAccess(token);
  const [profile, company, run, gaps, innovation] = await Promise.all([
    db.from("profiles").select("full_name").eq("id", account.id).maybeSingle(),
    db.from("companies").select("id, sector_id, sectors(name, slug)").eq("profile_id", account.id).maybeSingle(),
    db.from("methodology_v2_runs").select("phase, score").eq("profile_id", account.id).maybeSingle(),
    loadProfileGaps(token, account.id),
    db.rpc("open_innovation_joined"),
  ]);
  if (company.error) throw new Error(company.error.message);
  if (run.error) throw new Error(run.error.message);
  const sector = sectorOf(company.data?.sectors);
  const sectorId = company.data?.sector_id;
  const sessions = typeof sectorId === "string" ? await loadSectorSessions(token, sectorId) : [];
  const name = typeof profile.data?.full_name === "string" ? profile.data.full_name : "";
  return {
    name,
    email: account.email,
    companyId: typeof company.data?.id === "string" ? company.data.id : null,
    gaps: gaps.gaps,
    next: nextForSector(sessions, mexicoToday()),
    showEvaluation: showFirstEvaluation({
      sectorHasPack: sectorHasPackFor(sector.slug),
      finished: companyScore(run.data) !== null,
    }),
    showInnovation: innovation.data === false,
    sectorName: sector.name ?? "",
  };
}
