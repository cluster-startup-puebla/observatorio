import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { pendingLinkEmails } from "@/lib/admin/empresas/pending-link-emails";
import type { EmpresaSource } from "@/lib/admin/empresas/empresa-row";
import { companySeatColumns, toQuota } from "./cupo-seat";
import { confirmedSinCuenta } from "./confirmed-sin-cuenta";
import { toRsvpSeat, rsvpFillColumns } from "./rsvp-seat";

export async function fetchCuposSessionData(db: SupabaseClient, sessionId: string) {
  const companiesQuery = db
    .from("companies")
    .select(companySeatColumns)
    .eq("owner.role", "empresario")
    .not("owner.onboarded_at", "is", null)
    .eq("session_id", sessionId);
  const [quotas, rsvps, companies, pending, cancelled] = await Promise.all([
    db.from("session_sector_quotas").select("capacity, sectors(name, slug)").eq("session_id", sessionId),
    db.from("session_rsvps").select(rsvpFillColumns).eq("session_id", sessionId).in("status", ["confirmed", "pending"]),
    companiesQuery,
    pendingLinkEmails(db),
    db.from("attendance_cancellations").select("company_id"),
  ]);
  if (quotas.error) throw new Error(quotas.error.message);
  if (rsvps.error) throw new Error(rsvps.error.message);
  if (companies.error) throw new Error(companies.error.message);
  if (cancelled.error) throw new Error(cancelled.error.message);
  const released = new Set((cancelled.data ?? []).map((row) => String(row.company_id ?? "")).filter(Boolean));
  const seats = (rsvps.data ?? []).map(toRsvpSeat).filter((seat): seat is NonNullable<typeof seat> => seat !== null);
  const quotasRows = (quotas.data ?? []).flatMap((row) => {
    const quota = toQuota(row);
    return quota ? [quota] : [];
  });
  return {
    seats,
    quotasRows,
    companies: (companies.data ?? []) as EmpresaSource[],
    pending,
    released,
    confirmedSinCuenta: confirmedSinCuenta(rsvps.data ?? []),
  };
}