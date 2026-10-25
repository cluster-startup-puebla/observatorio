import { DiagnosticBanner } from "@/components/landing/sections/diagnostic-banner";
import { ReserveBand } from "@/components/landing/sections/reserve-band";
import { SectorOpen } from "@/components/landing/sections/sector-open";
import { Session } from "@/components/landing/sections/session";
import { Speakers } from "@/components/landing/sections/speakers";

export function SectorLanding({
  sector,
  reserveHref,
  brand,
  message,
}: {
  sector: string;
  reserveHref: string;
  brand?: { name: string; logoSrc: string | null } | null;
  message?: { headline: string; body: string } | null;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <SectorOpen sector={sector} reserveHref={reserveHref} brand={brand} message={message} />
      <Session />
      <Speakers />
      <ReserveBand href={reserveHref} />
      <DiagnosticBanner closing />
    </div>
  );
}
