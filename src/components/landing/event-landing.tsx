import { DiagnosticBanner } from "@/components/landing/sections/diagnostic-banner";
import { EventOpen } from "@/components/landing/sections/event-open";
import { ReserveBand } from "@/components/landing/sections/reserve-band";
import { Session } from "@/components/landing/sections/session";
import { Speakers } from "@/components/landing/sections/speakers";

export function EventLanding({ reserveHref = "/registro" }: { reserveHref?: string }) {
  return (
    <div className="flex flex-1 flex-col">
      <EventOpen reserveHref={reserveHref} />
      <Session />
      <Speakers />
      <ReserveBand href={reserveHref} />
      <DiagnosticBanner closing />
    </div>
  );
}
