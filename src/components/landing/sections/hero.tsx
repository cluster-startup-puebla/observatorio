import { Cta } from "@/components/landing/atoms/cta";
import { GovernmentLockup } from "@/components/landing/atoms/government-lockup";
import { Kicker } from "@/components/landing/atoms/kicker";
import { PartnerMark } from "@/components/landing/atoms/partner-mark";
import { ConvenerRow } from "@/components/landing/atoms/convener-row";
import { clusterLogo, ctaLabel } from "@/content/landing";

export function Hero({
  reserveHref = "/register",
  message = null,
}: {
  reserveHref?: string;
  message?: { headline: string; body: string } | null;
}) {
  return (
    <section
      id="inicio"
      data-testid="bloque-objetivo"
      className="flex min-h-[calc(100svh-4.5rem)] scroll-mt-24 flex-col border-b border-line"
    >
      <div className="container-site flex flex-1 flex-col py-8 lg:py-12">
        <Kicker>Levantamiento de necesidades</Kicker>
        <h1 className="mt-4 max-w-4xl text-balance text-[clamp(1.875rem,3.2vw,2.75rem)] leading-[1.08] font-bold tracking-[-0.03em] text-ink">
          {message
            ? message.headline
            : "Lo que Puebla no sabe que necesita, tu empresa puede decirlo primero."}
        </h1>
        {message ? <p data-testid="mensaje-sector">{message.body}</p> : null}
        <p className="text-body-lg mt-6 max-w-2xl text-ink-secondary">
          Participa en la sesión de tu sector, ayuda a construir el primer Observatorio
          Tecnológico del estado y sé de los primeros en probar las soluciones que surjan, en tu
          propia empresa.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Cta href={reserveHref}>{ctaLabel}</Cta>
          <Cta href="/#como" variant="secondary">
            Ver cómo funciona
          </Cta>
        </div>
        <div className="mt-auto grid gap-8 border-t border-line pt-8">
          <ul className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-end sm:gap-10">
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
            <li className="grid gap-2">
              <Kicker>Con el respaldo de</Kicker>
              <GovernmentLockup />
            </li>
          </ul>
          <div className="grid gap-2">
            <Kicker>Convocan</Kicker>
            <ConvenerRow />
          </div>
        </div>
      </div>
    </section>
  );
}
