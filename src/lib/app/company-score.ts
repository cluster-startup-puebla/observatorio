import type { V2LevelStep } from "@/lib/methodology/v2/bands";
import type { V2Answers, V2Question } from "@/lib/methodology/v2/types";
import { profileGaps } from "@/lib/home/profile-gaps";
import type { CompanyAction, CompanyGap } from "./company-actions";
import type { EvaluationTrace } from "./evaluation-trace";

export type CompanyScore = { band: string | null; ismsNivel2: number };

export type CompanyResult = {
  questions: V2Question[];
  answers: V2Answers;
  roadmap: V2LevelStep[];
  trace: EvaluationTrace;
};

export type CompanyHome = {
  legalName: string | null;
  sectorName: string | null;
  employeeBand: string | null;
  website: string | null;
  municipality: string | null;
  marketSize: string | null;
  referral: string | null;
  sessionInterest: string | null;
  logoUrl: string | null;
  convenerLogoUrl: string | null;
  score: CompanyScore | null;
  result: CompanyResult | null;
  actions: CompanyAction[];
};

export const emptyCompanyHome: CompanyHome = {
  legalName: null,
  sectorName: null,
  employeeBand: null,
  website: null,
  municipality: null,
  marketSize: null,
  referral: null,
  sessionInterest: null,
  logoUrl: null,
  convenerLogoUrl: null,
  score: null,
  result: null,
  actions: [],
};

type Sector = { name?: string | null; slug?: string | null };

export function sectorOf(value: unknown) {
  const sector = Array.isArray(value) ? value[0] : value;
  if (!sector || typeof sector !== "object") return { name: null, slug: "" };
  const row = sector as Sector;
  return { name: row.name ?? null, slug: row.slug ?? "" };
}

export function companyScore(row: { phase?: string; score?: unknown } | null): CompanyScore | null {
  if (row?.phase !== "done" || !row.score || typeof row.score !== "object" || Array.isArray(row.score)) {
    return null;
  }
  const score = row.score as { ismsNivel2?: unknown; band?: unknown };
  if (typeof score.ismsNivel2 !== "number" || !Number.isFinite(score.ismsNivel2)) return null;
  const band = typeof score.band === "string" ? score.band.trim() : "";
  return { band: band || null, ismsNivel2: score.ismsNivel2 };
}

export function companyGaps(hasLogo: boolean, website: string | null): CompanyGap[] {
  return profileGaps({ hasLogo, website: website ?? "", emailConfirmed: true }).gaps.flatMap((gap) =>
    gap.id === "logo" || gap.id === "website" ? [gap.id] : [],
  );
}
