import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { attendingCompanies, type AttendingInput } from "./attending";
import { waitsForExternalApproval } from "./external-approval";
import { pendingLinkEmails } from "./pending-link-emails";

function one<T>(value: T | T[] | null | undefined) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function loadAttending(sector: string | null) {
  const db = await adminDb();
  if (!db) return attendingCompanies([], sector);
  const result = await db
    .from("companies")
    .select("id, legal_name, show_logo_on_event, sector_source, admitted_at, sectors(name, slug), profiles!inner(onboarded_at, role, email)")
    .eq("profiles.role", "empresario")
    .not("profiles.onboarded_at", "is", null);
  if (result.error) throw new Error(result.error.message);
  const pending = await pendingLinkEmails(db);
  const rows: AttendingInput[] = (result.data ?? []).map((row) => {
    const sectorInfo = one(row.sectors as { name?: string; slug?: string } | { name?: string; slug?: string }[] | null);
    const profile = one(
      row.profiles as
        | { onboarded_at?: string | null; role?: string; email?: string }
        | { onboarded_at?: string | null; role?: string; email?: string }[]
        | null,
    );
    const email = String(profile?.email ?? "").trim().toLowerCase();
    return {
      id: String(row.id),
      legalName: String(row.legal_name),
      sectorSlug: sectorInfo?.slug ?? "",
      sectorName: sectorInfo?.name ?? "",
      showLogo: Boolean(row.show_logo_on_event),
      onboarded: Boolean(profile?.onboarded_at),
      role: profile?.role ?? "",
      linkStatus: pending.has(email) ? "cargado" : null,
      externalPending: waitsForExternalApproval(String(row.sector_source ?? ""), row.admitted_at ?? null),
    };
  });
  return attendingCompanies(rows, sector);
}
