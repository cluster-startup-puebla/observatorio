import { Cta } from "@/components/landing/atoms/cta";
import { EventTitle } from "@/components/landing/atoms/event-title";
import { ctaLabel } from "@/content/landing";
import { LandingMarks } from "./landing-marks";

export function EventOpen({ reserveHref = "/register" }: { reserveHref?: string }) {
  return (
    <section id="inicio" data-testid="bloque-objetivo" className="border-b border-line">
      <div className="container-site grid gap-6 py-8">
        <div className="grid max-w-3xl gap-4">
          <EventTitle />
          <h1 className="text-balance text-[clamp(1.35rem,2vw,1.75rem)] leading-snug font-bold tracking-[-0.03em] text-ink">
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
