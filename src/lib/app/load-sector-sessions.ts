import "server-only";

import { connection } from "next/server";
import type { SectorSession } from "@/lib/app/sector-sessions";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";

const columns = "title, public_slug, session_on, venue, session_sector_quotas!inner(sector_id)";

type SessionRow = {
  title: string;
  public_slug: string;
  session_on: string;
  venue: string | null;
};

function toSectorSession(row: SessionRow): SectorSession {
  return {
    publicSlug: row.public_slug,
    title: row.title,
    sessionOn: row.session_on.slice(0, 10),
    venue: row.venue ?? "",
  };
}

export async function loadSectorSessions(token: string, sectorId: string) {
  await connection();
  const result = await createSupabaseWithAccess(token)
    .from("sessions")
    .select(columns)
    .eq("session_sector_quotas.sector_id", sectorId);
  if (result.error) throw new Error(result.error.message);
  return ((result.data ?? []) as SessionRow[]).map(toSectorSession);
}

export async function loadSessionDetail(token: string, sectorId: string, slug: string) {
  const rows = await loadSectorSessions(token, sectorId);
  return rows.find((row) => row.publicSlug === slug) ?? null;
}
