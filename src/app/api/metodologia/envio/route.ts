import { NextResponse } from "next/server";
import { applyRun, type RunInput, type RunRow } from "@/lib/methodology/v2/apply-run";
import { memoryRuns, saveRun } from "@/lib/methodology/v2/memory-runs";
import { readAccountId } from "@/lib/session";
import { createSupabaseWithAccess, readAccessToken, usesSupabaseAuth } from "@/lib/supabase/auth-session";

const columns =
  "started_at, updated_at, finished_at, score, answers, cursor, phase, instrument_id, profile_id";

function denied() {
  return NextResponse.json({ error: "no autorizado" }, { status: 401 });
}

function toRun(row: (RunRow & { profile_id: string }) | null): RunRow | null {
  if (!row) return null;
  return {
    instrument_id: row.instrument_id,
    answers: row.answers,
    cursor: row.cursor,
    phase: row.phase,
    started_at: row.started_at,
    finished_at: row.finished_at,
    score: row.score,
    updated_at: row.updated_at,
  };
}

async function readInput(request: Request): Promise<RunInput | null> {
  const body = (await request.json()) as Partial<RunInput> | null;
  if (!body?.instrumentId || body.answers == null || typeof body.index !== "number") return null;
  if (!body.phase || !body.updatedAt) return null;
  return {
    instrumentId: body.instrumentId,
    answers: body.answers,
    index: body.index,
    phase: body.phase,
    score: body.score ?? null,
    updatedAt: body.updatedAt,
  };
}

export async function POST(request: Request) {
  const input = await readInput(request).catch(() => null);
  if (!input) return NextResponse.json({ error: "cuerpo inválido" }, { status: 400 });
  const now = new Date().toISOString();

  if (!usesSupabaseAuth()) {
    const profileId = await readAccountId();
    if (!profileId) return denied();
    const current = memoryRuns().get(profileId) ?? null;
    saveRun(profileId, applyRun(current, input, now));
    return NextResponse.json({ ok: true });
  }

  const token = await readAccessToken();
  if (!token) return denied();
  const db = createSupabaseWithAccess(token);
  const user = await db.auth.getUser();
  const profileId = user.data.user?.id;
  if (user.error || !profileId) return denied();

  const current = await db
    .from("methodology_v2_runs")
    .select(columns)
    .eq("profile_id", profileId)
    .maybeSingle();
  if (current.error) return NextResponse.json({ error: "no se pudo leer el envío" }, { status: 500 });

  const result = applyRun(toRun(current.data), input, now);
  if (!result.wrote) return NextResponse.json({ ok: true });

  const saved = await db.from("methodology_v2_runs").upsert(
    { profile_id: profileId, ...result.row },
    { onConflict: "profile_id" },
  );
  if (saved.error) return NextResponse.json({ error: "no se pudo guardar el envío" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
