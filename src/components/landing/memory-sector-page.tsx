import { EventLanding } from "@/components/landing/event-landing";
import { SectorLanding } from "@/components/landing/sector-landing";
import { OrgHome } from "@/components/organismo/home";
import { publicSectorPage } from "@/lib/landing/public-sector-page";
import { getDirectory } from "@/lib/memory-directory";
import { captureFinishedInvite } from "@/lib/organismo/capture-invite";
import { eventToken } from "@/lib/organismo/event-token";
import { inviteBrand } from "@/lib/organismo/invite-brand";
import { readInviteLink } from "@/lib/organismo/invite-link-cookie";
import { ownerBySlug } from "@/lib/organismo/owner";
import { reserveHref, resolveSector } from "@/lib/sectors";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { recordLinkOpen } from "@/lib/supabase/link-opens";

type Search = { [key: string]: string | string[] | undefined };

export async function MemorySectorPage({ sector, searchParams }: { sector: string; searchParams: Search }) {
  const owner = await ownerBySlug(sector);
  if (owner) {
    const saved = await readInviteLink(owner.slug);
    const enlace = typeof searchParams.enlace === "string" ? searchParams.enlace : saved?.url;
    const inviteSector = typeof searchParams.sector === "string" ? searchParams.sector : saved?.sector;
    return (
      <OrgHome
        slug={owner.slug}
        name={owner.name}
        orgId={owner.id}
        url={enlace}
        sector={inviteSector}
        failed={searchParams.error === "enlace"}
        ready={typeof searchParams.enlace === "string"}
        corte={typeof searchParams.corte === "string" ? searchParams.corte : undefined}
        brandColor={owner.brandColor}
      />
    );
  }
  const token = eventToken(searchParams);
  const resolved = resolveSector({ pathSector: sector });
  if (token && resolved.slug) await recordOpen(token, resolved.slug);
  const href = reserveHref(`/${sector}`, token);
  if (!resolved.name || !resolved.slug) return <EventLanding reserveHref={href} />;
  const brand = token ? await inviteBrand(token) : null;
  const message = await publicSectorPage(resolved.slug);
  return <SectorLanding sector={resolved.name} reserveHref={href} brand={brand} message={message} />;
}

async function recordOpen(token: string, slug: string) {
  const { connection } = await import("next/server");
  await connection();
  const open = { token, sectorSlug: slug, at: new Date().toISOString() };
  if (usesSupabaseAuth()) await recordLinkOpen(open);
  else await getDirectory().recordOpen(open);
  await captureFinishedInvite(token, slug);
}
