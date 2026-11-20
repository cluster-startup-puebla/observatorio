import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { redirect } from "next/navigation";
import { loadSessionDetail } from "@/lib/app/load-sector-sessions";
import { sessionLife, sessionsTag } from "@/lib/app/view-cache";
import { readSessionAccount } from "@/lib/auth/session-account";
import { sessionOnLabel } from "@/lib/sessions/face";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";

export const instant = false;

const attendanceCopy: Record<string, string> = {
  ocupa: "Ya tienes lugar",
  espera: "Tu lugar se confirma aparte",
  cancelo: "Cancelaste tu lugar",
};

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

  const state = await createSupabaseWithAccess(token).rpc("my_attendance_state");
  const code = typeof state.data === "string" ? state.data : "";
  const status = attendanceCopy[code] ?? "";

  return (
    <article className="grid w-full max-w-2xl gap-3 md:max-w-none">
      <h1 className="text-[1.4rem] leading-[1.15] text-ink">{session.title}</h1>
      <p className="text-body text-ink">{sessionOnLabel(session.sessionOn)}</p>
      <p className="text-body text-ink-secondary">{session.venue}</p>
      {status ? <p className="text-body text-ink">{status}</p> : null}
    </article>
  );
}
