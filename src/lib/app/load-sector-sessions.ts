import "server-only";

import type { SectorSession } from "@/lib/app/sector-sessions";
import { sessionVisibleToSector } from "@/lib/app/session-visible";
import { createSupabaseWithAccess } from "@/lib/supabase/auth-session";

const columns = "title, public_slug, session_on, venue, session_sector_quotas(sector_id)";

type SessionRow = {
  title: string;
  public_slug: string;
  session_on: string;
  venue: string | null;
  session_sector_quotas?: { sector_id: string }[] | null;
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
  const result = await createSupabaseWithAccess(token).from("sessions").select(columns);
  if (result.error) throw new Error(result.error.message);
  return ((result.data ?? []) as SessionRow[])
    .filter((row) => sessionVisibleToSector(row.session_sector_quotas, sectorId))
    .map(toSectorSession);
}

export async function loadSessionDetail(token: string, sectorId: string, slug: string) {
  const rows = await loadSectorSessions(token, sectorId);
  return rows.find((row) => row.publicSlug === slug) ?? null;
}
