import { getDirectory } from "@/lib/memory-directory";
import type { RunRow } from "@/lib/methodology/v2/apply-run";
import { memoryRuns } from "@/lib/methodology/v2/memory-runs";
import { sectorSlug, sectors } from "@/lib/sectors";
import { readAccountId } from "@/lib/session";
import { createSupabaseWithAccess, readAccessToken, usesSupabaseAuth } from "@/lib/supabase/auth-session";

export type SignedSector = {
  profileId: string;
  slug: string;
  remote: RunRow | null;
};

const empty: SignedSector = { profileId: "", slug: "", remote: null };
const runColumns =
  "instrument_id, answers, cursor, phase, started_at, finished_at, score, updated_at";

function memorySession() {
  if (process.env.DIRECTORY === "memory") return true;
  if (process.env.AUTH_PROVIDER === "memory") return true;
  return !usesSupabaseAuth();
}

export async function signedSector(): Promise<SignedSector> {
  if (memorySession()) return readMemory();
  return readSupabase();
}

async function readMemory(): Promise<SignedSector> {
  const profileId = (await readAccountId()) ?? "";
  if (!profileId) return empty;
  const account = await getDirectory().getAccount(profileId);
  return {
    profileId: account?.id ?? profileId,
    slug: account?.sectorSlug ?? "",
    remote: memoryRuns().get(profileId) ?? null,
  };
}

function slugFromName(name: string) {
  const known = sectors.find((item) => item.name.toLowerCase() === name.trim().toLowerCase());
  return known?.slug ?? sectorSlug(name);
}

function asRow(value: unknown): RunRow | null {
  if (!value || typeof value !== "object") return null;
  const row = value as RunRow;
  if (typeof row.instrument_id !== "string" || row.answers == null) return null;
  return row;
}

async function readSupabase(): Promise<SignedSector> {
  const token = await readAccessToken();
  if (!token) return empty;
  const db = createSupabaseWithAccess(token);
  const user = await db.auth.getUser();
  const profileId = user.data.user?.id ?? "";
  if (user.error || !profileId) return empty;

  const company = await db.from("companies").select("sector_id").eq("profile_id", profileId).maybeSingle();
  if (company.error) throw new Error(company.error.message);
  const sectorId = company.data?.sector_id;
  const sector = sectorId
    ? await db.from("sectors").select("name").eq("id", sectorId).maybeSingle()
    : null;
  if (sector?.error) throw new Error(sector.error.message);

  const run = await db.from("methodology_v2_runs").select(runColumns).eq("profile_id", profileId).maybeSingle();
  if (run.error) throw new Error(run.error.message);
  return {
    profileId,
    slug: slugFromName(String(sector?.data?.name ?? "")),
    remote: asRow(run.data),
  };
}
