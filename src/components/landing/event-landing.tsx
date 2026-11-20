import { DiagnosticBanner } from "@/components/landing/sections/diagnostic-banner";
import { EventOpen } from "@/components/landing/sections/event-open";
import { ReserveBand } from "@/components/landing/sections/reserve-band";
import { Session } from "@/components/landing/sections/session";
import { Speakers } from "@/components/landing/sections/speakers";
import { forumSectors } from "@/content/forum-public";
import { sessionPiecePath } from "@/lib/sessions/public-path";

function sectorLinks(sessionSlug?: string) {
  if (!sessionSlug) return undefined;
  return forumSectors.map((sector) => ({
    name: sector.name,
    href: sessionPiecePath(sessionSlug, sector.href.replace(/^\//, "")),
  }));
}

export function EventLanding({
  reserveHref = "/crear-cuenta",
  sessionSlug,
}: {
  reserveHref?: string;
  sessionSlug?: string;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <EventOpen reserveHref={reserveHref} />
      <Session sectors={sectorLinks(sessionSlug)} />
      <Speakers />
      <ReserveBand href={reserveHref} />
      <DiagnosticBanner closing />
    </div>
  );
}
