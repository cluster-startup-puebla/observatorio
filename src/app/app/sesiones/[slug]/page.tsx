import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { redirect } from "next/navigation";
import { CancelSessionRsvp } from "@/components/app/cancel-session-rsvp";
import { ClaimSessionButton } from "@/components/app/claim-session-button";
import { SessionDetailShell } from "@/components/app/session-detail-shell";
import { SessionPassQr } from "@/components/app/session-pass-qr";
import { SessionPassWaiting } from "@/components/app/session-pass-waiting";
import { loadPassAuthorization } from "@/lib/app/load-pass-authorization";
import { sessionAttendanceLabel } from "@/lib/app/session-attendance";
import { loadSessionDetail } from "@/lib/app/load-sector-sessions";
import { sessionLife, sessionsTag } from "@/lib/app/view-cache";
import { readSessionAccount } from "@/lib/auth/session-account";
import { sessionOnLabel } from "@/lib/sessions/face";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";

export const instant = false;

async function companySectorId(token: string, profileId: string) {
  const company = await createSupabaseWithAccess(token)
    .from("companies")
    .select("sector_id")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (company.error) throw new Error(company.error.message);
  const sectorId = company.data?.sector_id;
  return typeof sectorId === "string" ? sectorId : "";
}

export default function SessionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={null}>
      <SessionDetail params={params} />
    </Suspense>
  );
}

async function SessionDetail({ params }: { params: Promise<{ slug: string }> }) {
  "use cache: private";
  cacheLife(sessionLife);
  const { slug } = await params;
  const account = await readSessionAccount();
  const token = await readAccessToken();
  if (account) cacheTag(sessionsTag(account.id));
  if (!account || !token) redirect("/app/sesiones");

  const sectorId = await companySectorId(token, account.id);
  const session = sectorId ? await loadSessionDetail(token, sectorId, slug) : null;
  if (!session) redirect("/app/sesiones");

  const attendance = await sessionAttendanceLabel(token, account.id, slug);
  const passOk = attendance.rsvpId
    ? await loadPassAuthorization(token, account.id, account.email)
    : false;

  const status =
    attendance.rsvpId && passOk
      ? "Ya tienes lugar"
      : attendance.label || undefined;

  return (
    <SessionDetailShell
      title={session.title}
      when={sessionOnLabel(session.sessionOn)}
      venue={session.venue}
      status={status}
    >
      <div className="grid gap-4">
        {attendance.rsvpId && passOk ? <SessionPassQr rsvpId={attendance.rsvpId} /> : null}
        {attendance.rsvpId && !passOk ? <SessionPassWaiting /> : null}
        {attendance.canClaim && attendance.sessionId ? <ClaimSessionButton sessionId={attendance.sessionId} /> : null}
        {attendance.canCancel && attendance.sessionId ? <CancelSessionRsvp sessionId={attendance.sessionId} /> : null}
      </div>
    </SessionDetailShell>
  );
}
