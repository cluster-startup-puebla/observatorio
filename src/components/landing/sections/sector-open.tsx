import { Cta } from "@/components/landing/atoms/cta";
import { GovernmentLockup } from "@/components/landing/atoms/government-lockup";
import { Kicker } from "@/components/landing/atoms/kicker";
import { PartnerMark } from "@/components/landing/atoms/partner-mark";
import { clusterLogo, ctaLabel } from "@/content/landing";
import { InviteMark } from "./invite-mark";
import { inviteLine } from "./invite-intro";
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
      <div className="container-site grid gap-10 py-12 lg:py-16">
        <div className="grid max-w-3xl gap-6 sm:gap-8">
          <InviteMark brand={brand} />
          <div className="grid gap-5">
            <Kicker>Levantamiento de necesidades</Kicker>
            <h1
              data-testid="sector-seleccionado"
              className="text-balance text-[clamp(1.75rem,2.8vw,2.5rem)] leading-[1.12] font-bold tracking-[-0.03em] text-ink"
            >
              {inviteLine(sector, brand?.name)}
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
        <ul className="flex flex-col gap-8 border-t border-line pt-8 sm:flex-row sm:items-end sm:gap-12">
          <li className="grid gap-2">
            <Kicker>Con el respaldo de</Kicker>
            <GovernmentLockup />
          </li>
          <li className="grid gap-2">
            <Kicker>Opera</Kicker>
            <PartnerMark
              src={clusterLogo.src}
              alt={clusterLogo.alt}
              width={clusterLogo.width}
              height={clusterLogo.height}
              className={clusterLogo.className}
            />
          </li>
        </ul>
      </div>
    </section>
  );
}
