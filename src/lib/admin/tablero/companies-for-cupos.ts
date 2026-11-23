import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { EmpresaSource } from "@/lib/admin/empresas/empresa-row";
import { companySeatColumns } from "./cupo-seat";

/** Companies on the session plus any linked from RSVPs (session_id may be null). */
export async function companiesForCupos(
  db: SupabaseClient,
  sessionId: string,
  rsvpCompanyIds: string[],
) {
  const base = () =>
    db
      .from("companies")
      .select(companySeatColumns)
      .eq("owner.role", "empresario")
      .not("owner.onboarded_at", "is", null);
  const ids = [...new Set(rsvpCompanyIds.filter(Boolean))];
  const [bySession, byRsvp] = await Promise.all([
    base().eq("session_id", sessionId),
    ids.length ? base().in("id", ids) : Promise.resolve({ data: [] as EmpresaSource[], error: null }),
  ]);
  if (bySession.error) throw new Error(bySession.error.message);
  if (byRsvp.error) throw new Error(byRsvp.error.message);
  const map = new Map<string, EmpresaSource>();
  for (const row of [...(bySession.data ?? []), ...(byRsvp.data ?? [])] as EmpresaSource[]) {
    map.set(row.id, row);
  }
  return [...map.values()];
}
