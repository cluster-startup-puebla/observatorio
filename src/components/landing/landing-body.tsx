import { Backers } from "@/components/landing/sections/backers";
import { Benefits } from "@/components/landing/sections/benefits";
import { Boundaries } from "@/components/landing/sections/boundaries";
import { DiagnosticBanner } from "@/components/landing/sections/diagnostic-banner";
import { Faq } from "@/components/landing/sections/faq";
import { Hero } from "@/components/landing/sections/hero";
import { Pipeline } from "@/components/landing/sections/pipeline";
import { Problem } from "@/components/landing/sections/problem";
import { ReserveBand } from "@/components/landing/sections/reserve-band";
import { Sectors } from "@/components/landing/sections/sectors";
import { Session } from "@/components/landing/sections/session";
import { StickyCta } from "@/components/landing/sections/sticky-cta";
import { Topics } from "@/components/landing/sections/topics";
import { Vision } from "@/components/landing/sections/vision";

export function LandingBody({
  reserveHref = "/register",
  selected,
}: {
  reserveHref?: string;
  selected?: string | null;
}) {
  return (
    <div className="pb-24 lg:pb-0">
      {selected ? (
        <p data-testid="sector-seleccionado" className="container-site pt-8 text-h3 text-ink">
          {selected}
        </p>
      ) : null}
      <Hero reserveHref={reserveHref} />
      <DiagnosticBanner />
      <Problem />
      <Pipeline />
      <Vision />
      <Benefits />
      <Topics />
      <Sectors />
      <Session />
      <Backers />
      <Boundaries />
      <Faq />
      <ReserveBand href={reserveHref} />
      <StickyCta />
    </div>
  );
}
