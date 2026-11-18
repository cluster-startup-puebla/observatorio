import { summarize, type ClosedRun } from "@/lib/admin/diagnosticos/summary";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { memoryRuns } from "@/lib/methodology/v2/memory-runs";
import { createSupabaseWithAccess, readAccessToken, usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { NextResponse } from "next/server";

function memoryNotes(): ClosedRun[] {
  return [...memoryRuns().values()]
    .filter((row) => row.finished_at !== null)
    .map((row) => ({ instrumentId: row.instrument_id, score: row.score }));
}

function note(value: unknown): ClosedRun["score"] {
  if (!value || typeof value !== "object") return null;
  const score = value as { ismsNivel2?: number; band?: string };
  return { ismsNivel2: score.ismsNivel2, band: score.band };
}

export async function GET() {
  await requireSuperadmin();
  if (!usesSupabaseAuth()) {
    return NextResponse.json(summarize(memoryNotes()));
  }
  const token = await readAccessToken();
  if (!token) return NextResponse.json({ error: "Sin sesión" }, { status: 401 });
  const { data, error } = await createSupabaseWithAccess(token)
    .from("methodology_v2_runs")
    .select("instrument_id, score")
    .not("finished_at", "is", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = (data ?? []).map((row) => ({
    instrumentId: String(row.instrument_id),
    score: note(row.score),
  }));
  return NextResponse.json(summarize(rows));
}
