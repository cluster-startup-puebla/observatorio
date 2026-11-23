import { Cta } from "@/components/landing/atoms/cta";
import { Kicker } from "@/components/landing/atoms/kicker";
import { PortalBackers } from "@/components/landing/portal-backers";
import { observatorioCta, portalKicker } from "@/content/portal";
// import { startupsCta } from "@/content/portal";

export function PortalHero() {
  return (
    <section
      id="inicio"
      data-testid="portal-hero"
      className="flex min-h-[calc(100svh-4.5rem)] scroll-mt-24 flex-col bg-surface"
    >
      <div className="container-site flex flex-1 flex-col py-10 lg:py-14">
        <Kicker>{portalKicker}</Kicker>
        <h1 className="pxp-display mt-5 text-ink">
          Puebla
          <br />
          <span className="text-program-x">x</span> Puebla
        </h1>
        <div className="mt-8 flex flex-wrap gap-3">
          <Cta href={observatorioCta.href}>{observatorioCta.label}</Cta>
          {/* Startups B2B — pendiente de producto
          <Cta href={startupsCta.href} variant="secondary">
            {startupsCta.label}
          </Cta>
          */}
        </div>
        <div className="mt-auto pt-12">
          <PortalBackers />
        </div>
      </div>
    </section>
  );
}
