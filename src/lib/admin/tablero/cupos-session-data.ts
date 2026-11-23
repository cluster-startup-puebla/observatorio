import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { pendingLinkEmails } from "@/lib/admin/empresas/pending-link-emails";
import { companiesForCupos } from "./companies-for-cupos";
import { toQuota } from "./cupo-seat";
import { confirmedSinCuenta } from "./confirmed-sin-cuenta";
import { toRsvpSeat, rsvpFillColumns } from "./rsvp-seat";

const rsvpCompanyColumns = `${rsvpFillColumns}, company_id`;

export async function fetchCuposSessionData(db: SupabaseClient, sessionId: string) {
  const [quotas, rsvps, pending, cancelled] = await Promise.all([
    db.from("session_sector_quotas").select("capacity, sectors(name, slug)").eq("session_id", sessionId),
    db.from("session_rsvps").select(rsvpCompanyColumns).eq("session_id", sessionId).in("status", ["confirmed", "pending"]),
    pendingLinkEmails(db),
    db.from("attendance_cancellations").select("company_id"),
  ]);
  if (quotas.error) throw new Error(quotas.error.message);
  if (rsvps.error) throw new Error(rsvps.error.message);
  if (cancelled.error) throw new Error(cancelled.error.message);
  const rsvpRows = rsvps.data ?? [];
  const companyIds = rsvpRows.map((row) => String(row.company_id ?? "")).filter(Boolean);
  const companies = await companiesForCupos(db, sessionId, companyIds);
  const released = new Set((cancelled.data ?? []).map((row) => String(row.company_id ?? "")).filter(Boolean));
  const seats = rsvpRows.map(toRsvpSeat).filter((seat): seat is NonNullable<typeof seat> => seat !== null);
  const quotasRows = (quotas.data ?? []).flatMap((row) => {
    const quota = toQuota(row);
    return quota ? [quota] : [];
  });
  return {
    seats,
    quotasRows,
    companies,
    pending,
    released,
    confirmedSinCuenta: confirmedSinCuenta(rsvpRows),
  };
}