import { Cta } from "@/components/landing/atoms/cta";
import { EventTitle } from "@/components/landing/atoms/event-title";
import { ctaLabel } from "@/content/landing";
import { LandingMarks } from "./landing-marks";

export function EventOpen({ reserveHref = "/registro" }: { reserveHref?: string }) {
  return (
    <section id="inicio" data-testid="bloque-objetivo" className="bg-surface-subtle">
      <div className="container-site grid gap-6 py-8 lg:py-12">
        <div className="grid max-w-3xl gap-5">
          <EventTitle />
          <h1 className="max-w-3xl text-balance text-[clamp(2rem,3vw,2.5rem)] leading-[1.15] font-bold tracking-[-0.02em] text-ink">
            Lo que Puebla no sabe que necesita, tu empresa puede decirlo primero.
          </h1>
          <p className="text-body-lg max-w-2xl text-ink-secondary">
            Participa en la sesión de tu sector, ayuda a construir el primer Observatorio Tecnológico
            del estado y sé de los primeros en probar las soluciones que surjan, en tu propia empresa.
          </p>
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
