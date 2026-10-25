import type { Metadata } from "next";

export const instant = false;
import { LandingBody } from "@/components/landing/landing-body";
import { SectorLanding } from "@/components/landing/sector-landing";
import { OrgHome } from "@/components/organismo/home";
import { getDirectory } from "@/lib/memory-directory";
import { recordLinkOpen } from "@/lib/supabase/link-opens";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { pageMetadata, siteDescription, siteName } from "@/lib/metadata";
import { eventToken } from "@/lib/organismo/event-token";
import { inviteBrand } from "@/lib/organismo/invite-brand";
import { readInviteLink } from "@/lib/organismo/invite-link-cookie";
import { captureFinishedInvite } from "@/lib/organismo/capture-invite";
import { ownerBySlug } from "@/lib/organismo/owner";
import { publicSectorPage } from "@/lib/landing/public-sector-page";
import { reserveHref, resolveSector } from "@/lib/sectors";

export const metadata: Metadata = pageMetadata({
  title: siteName,
  description: siteDescription,
  path: "/",
});

export default async function SectorPage({
  params,
  searchParams,
}: {
  params: Promise<{ sector: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { sector } = await params;
  const sp = await searchParams;
  const owner = await ownerBySlug(sector);
  if (owner) {
    const saved = await readInviteLink(owner.slug);
    const enlace = typeof sp.enlace === "string" ? sp.enlace : saved?.url;
    const inviteSector = typeof sp.sector === "string" ? sp.sector : saved?.sector;
    return (
      <OrgHome
        slug={owner.slug}
        name={owner.name}
        orgId={owner.id}
        url={enlace}
        sector={inviteSector}
        failed={sp.error === "enlace"}
        ready={typeof sp.enlace === "string"}
        corte={typeof sp.corte === "string" ? sp.corte : undefined}
      />
    );
  }
  const token = eventToken(sp);
  const resolved = resolveSector({ pathSector: sector });
  if (token && resolved.slug) {
    const { connection } = await import("next/server");
    await connection();
    const open = { token, sectorSlug: resolved.slug, at: new Date().toISOString() };
    if (usesSupabaseAuth()) await recordLinkOpen(open);
    else await getDirectory().recordOpen(open);
    await captureFinishedInvite(token, resolved.slug);
  }
  const href = reserveHref(`/${sector}`, token);
  if (!resolved.name || !resolved.slug) return <LandingBody reserveHref={href} />;
  const brand = token ? await inviteBrand(token) : null;
  const message = await publicSectorPage(resolved.slug);
  return <SectorLanding sector={resolved.name} reserveHref={href} brand={brand} message={message} />;
}
