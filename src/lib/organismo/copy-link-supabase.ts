import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { readSessionAccount } from "@/lib/auth/session-account";
import { sealRef } from "@/lib/ref-token";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";
import { sessionPiecePath } from "@/lib/sessions/public-path";
import { boundSessionId, invitePath } from "./invite-path";
import { writeInviteLink } from "./invite-link-cookie";

function refSecret() {
  return process.env.REF_SECRET ?? "e2e-ref-secret";
}

function failHome(slug: string, publicSlug?: string | null) {
  const home = publicSlug ? sessionPiecePath(publicSlug, slug) : `/${slug}`;
  redirect(`${home}?error=enlace`);
}

export async function copySupabaseEventLink(sectorSlug: string, requestedSession = "") {
  const account = await readSessionAccount();
  const access = await readAccessToken();
  if (!account || !access) redirect("/login");

  const db = createSupabaseWithAccess(access);
  const profile = await db.from("profiles").select("organization_id").eq("id", account.id).maybeSingle();
  const orgId = profile.data?.organization_id;
  if (!orgId) redirect("/onboarding");

  const org = await db.from("organizations").select("slug").eq("id", orgId).maybeSingle();
  const slug = org.data?.slug;
  if (!slug) redirect("/onboarding");

  const sector = await db.from("sectors").select("id").eq("slug", sectorSlug).maybeSingle();
  if (sector.error || !sector.data) {
    console.error("[organismo] enlace", sector.error?.message ?? "sector");
    failHome(slug);
  }

  const currents = await db.from("sessions").select("id, public_slug").eq("is_current", true);
  if (currents.error) {
    console.error("[organismo] enlace", currents.error.message);
    failHome(slug);
  }
  const bound = boundSessionId(requestedSession, (currents.data ?? []).map((row) => row.id));
  if (!bound.ok) failHome(slug);

  let publicSlug = (currents.data ?? []).find((row) => row.id === bound.sessionId)?.public_slug ?? null;
  if (!publicSlug && bound.sessionId) {
    const one = await db.from("sessions").select("public_slug").eq("id", bound.sessionId).maybeSingle();
    publicSlug = one.data?.public_slug ?? null;
  }

  const inserted = await db.from("link_copies").insert({
    organization_id: orgId,
    sector_id: sector.data!.id,
    actor_id: account.id,
    session_id: bound.sessionId,
  });
  if (inserted.error) {
    console.error("[organismo] enlace insert", inserted.error.message, {
      orgId,
      sectorId: sector.data!.id,
      sessionId: bound.sessionId,
    });
    failHome(slug, publicSlug);
  }

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}${invitePath(sectorSlug, sealRef(orgId, refSecret()), bound.sessionId, publicSlug)}`;
  await writeInviteLink(slug, { url, sector: sectorSlug });
  const back = new URLSearchParams({ enlace: url, sector: sectorSlug });
  const home = publicSlug ? sessionPiecePath(publicSlug, slug) : `/${slug}`;
  redirect(`${home}?${back.toString()}`);
}
