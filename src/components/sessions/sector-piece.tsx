import { SectorLanding } from "@/components/landing/sector-landing";
import { publicSectorPage } from "@/lib/landing/public-sector-page";
import { getDirectory } from "@/lib/memory-directory";
import { captureFinishedInvite } from "@/lib/organismo/capture-invite";
import { eventToken } from "@/lib/organismo/event-token";
import { inviteBrand } from "@/lib/organismo/invite-brand";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { recordLinkOpen } from "@/lib/supabase/link-opens";
import { reserveHref } from "@/lib/sectors";

type Search = { [key: string]: string | string[] | undefined };

export async function SectorPiece({
  name,
  slug,
  searchParams,
}: {
  name: string;
  slug: string;
  searchParams: Search;
}) {
  const token = eventToken(searchParams);
  if (token) await recordSectorOpen(token, slug);
  const href = reserveHref(`/${slug}`, token);
  const brand = token ? await inviteBrand(token) : null;
  const message = await publicSectorPage(slug);
  return <SectorLanding sector={name} reserveHref={href} brand={brand} message={message} />;
}

async function recordSectorOpen(token: string, slug: string) {
  const { connection } = await import("next/server");
  await connection();
  const open = { token, sectorSlug: slug, at: new Date().toISOString() };
  if (usesSupabaseAuth()) await recordLinkOpen(open);
  else await getDirectory().recordOpen(open);
  await captureFinishedInvite(token, slug);
}
