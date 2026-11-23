import { SectorLanding } from "@/components/landing/sector-landing";
import { DisruptorsInviteLanding } from "@/components/sessions/disruptors/invite-landing";
import { disruptorsSlug } from "@/content/disruptors";
import { publicSectorPage } from "@/lib/landing/public-sector-page";
import { getDirectory } from "@/lib/memory-directory";
import { captureFinishedInvite } from "@/lib/organismo/capture-invite";
import { eventToken } from "@/lib/organismo/event-token";
import { inviteBrand } from "@/lib/organismo/invite-brand";
import { sessionReserveHref } from "@/lib/sessions/disruptors-reserve";
import { createSupabaseAnon, usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { recordLinkOpen } from "@/lib/supabase/link-opens";

type Search = { [key: string]: string | string[] | undefined };

export async function SectorPiece({
  name,
  slug,
  sessionSlug,
  searchParams,
}: {
  name: string;
  slug: string;
  sessionSlug?: string;
  searchParams: Search;
}) {
  const token = eventToken(searchParams);
  if (token) await recordSectorOpen(token, slug, searchParams, sessionSlug);
  const href = sessionReserveHref(sessionSlug, slug, token);
  const brand = token ? await inviteBrand(token) : null;
  if (sessionSlug === disruptorsSlug) {
    return <DisruptorsInviteLanding sector={name} reserveHref={href} brand={brand} />;
  }
  const message = await publicSectorPage(slug);
  return <SectorLanding sector={name} reserveHref={href} brand={brand} message={message} />;
}

async function recordSectorOpen(token: string, slug: string, searchParams: Search, sessionSlug?: string) {
  const { connection } = await import("next/server");
  await connection();
  const fromQuery = typeof searchParams.sesion === "string" ? searchParams.sesion : null;
  const sessionId = fromQuery ?? (sessionSlug ? await sessionIdFromSlug(sessionSlug) : null);
  const open = { token, sectorSlug: slug, at: new Date().toISOString(), sessionId };
  if (usesSupabaseAuth()) await recordLinkOpen(open);
  else await getDirectory().recordOpen(open);
  await captureFinishedInvite(token, slug);
}

async function sessionIdFromSlug(publicSlug: string) {
  const db = createSupabaseAnon();
  const result = await db.from("sessions").select("id").eq("public_slug", publicSlug).maybeSingle();
  return result.data?.id ?? null;
}
