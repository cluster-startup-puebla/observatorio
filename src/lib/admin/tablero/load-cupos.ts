import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { companyOwner } from "@/lib/admin/empresas/company-owner";
import { waitsForExternalApproval } from "@/lib/admin/empresas/external-approval";
import { pendingLinkEmails } from "@/lib/admin/empresas/pending-link-emails";
import { sectorFill, type Seat, type SectorQuota } from "./sector-fill";

type SectorEmbed = { name?: string | null; slug?: string | null };
type ProfileEmbed = { role?: string | null; email?: string | null };

function one<T>(value: T | T[] | null | undefined) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function toSeat(
  row: {
    sector_source?: string | null;
    admitted_at?: string | null;
    sectors?: SectorEmbed | SectorEmbed[] | null;
    owner?: ProfileEmbed | ProfileEmbed[] | null;
  },
  pending: Set<string>,
): Seat {
  const sector = one(row.sectors);
  const profile = one(row.owner);
  const email = String(profile?.email ?? "").trim().toLowerCase();
  return {
    sectorSlug: sector?.slug ?? "",
    sectorName: sector?.name ?? "",
    onboarded: true,
    role: profile?.role ?? "",
    linkPending: pending.has(email),
    externalPending: waitsForExternalApproval(String(row.sector_source ?? ""), row.admitted_at ?? null),
  };
}

function toQuota(row: { capacity?: number | null; sectors?: SectorEmbed | SectorEmbed[] | null }): SectorQuota | null {
  const sector = one(row.sectors);
  if (!sector?.slug) return null;
  return { sectorSlug: sector.slug, sectorName: sector.name ?? "", capacity: Number(row.capacity ?? 0) };
}

type CupoSession = { id: string; venue: string; sessionOn: string | null };

function idle() {
  return { ...sectorFill([], []), session: null as CupoSession | null };
}

function chosen(row: { id: string; venue: string; session_on: string | null }): CupoSession {
  return { id: row.id, venue: row.venue, sessionOn: row.session_on };
}

export async function loadCupos(sessionId?: string | null) {
  const db = await adminDb();
  if (!db) return idle();
  const columns = "id, venue, session_on, capacity_max";
  const session = sessionId
    ? await db.from("sessions").select(columns).eq("id", sessionId).maybeSingle()
    : await db.from("sessions").select(columns).eq("is_current", true).maybeSingle();
  if (session.error) throw new Error(session.error.message);
  if (!session.data) return idle();
  const [quotas, companies, pending] = await Promise.all([
    db.from("session_sector_quotas").select("capacity, sectors(name, slug)").eq("session_id", session.data.id),
    db
      .from("companies")
      .select(`sector_source, admitted_at, sectors(name, slug), owner:${companyOwner}!inner(onboarded_at, role, email)`)
      .eq("owner.role", "empresario")
      .not("owner.onboarded_at", "is", null),
    pendingLinkEmails(db),
  ]);
  if (quotas.error) throw new Error(quotas.error.message);
  if (companies.error) throw new Error(companies.error.message);
  const seats = (companies.data ?? []).map((row) => toSeat(row, pending));
  const rows = (quotas.data ?? []).flatMap((row) => {
    const quota = toQuota(row);
    return quota ? [quota] : [];
  });
  return { ...sectorFill(rows, seats), session: chosen(session.data) };
}
