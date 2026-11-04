import { Cta } from "@/components/landing/atoms/cta";
import { EventTitle } from "@/components/landing/atoms/event-title";
import { ctaLabel } from "@/content/landing";
import { InviteMark } from "./invite-mark";
import { SectorInviteTitle } from "./invite-intro";
import { LandingMarks } from "./landing-marks";
import { SectorPageMessage } from "./sector-page-message";

type InviteBrand = { name: string; logoSrc: string | null };

export function SectorOpen({
  sector,
  reserveHref,
  brand,
  message,
}: {
  sector: string;
  reserveHref: string;
  brand?: InviteBrand | null;
  message?: { headline: string; body: string } | null;
}) {
  return (
    <section id="inicio" data-testid="bloque-objetivo" className="border-b border-line">
      <div className="container-site grid gap-6 py-8">
        <div className="grid max-w-3xl gap-6 sm:gap-8">
          <InviteMark brand={brand} />
          <div className="grid gap-5">
            <EventTitle />
            <h1
              data-testid="sector-seleccionado"
              className="text-body-lg max-w-2xl text-balance font-semibold leading-snug text-ink"
            >
              <SectorInviteTitle sector={sector} orgName={brand?.name} />
            </h1>
            <p className="text-body-lg max-w-2xl text-ink-secondary">
              Participa en la sesión de tu sector, ayuda a construir el primer Observatorio
              Tecnológico del estado y sé de los primeros en probar las soluciones que surjan, en tu
              propia empresa.
            </p>
            {message ? <SectorPageMessage headline={message.headline} body={message.body} /> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Cta href={reserveHref}>{ctaLabel}</Cta>
          <Cta href="#sesion" variant="secondary">
            Ver el minuto a minuto
          </Cta>
        </div>
        <LandingMarks />
      </div>
    </section>
  );
}
