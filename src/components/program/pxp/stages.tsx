import { CompanyCta, PrivacyCallout } from "./bits";
import { PxpFrame } from "./frame";
import { StageSequence } from "./stage-sequence";

const stages = [
  {
    n: "01",
    title: "Levantamiento de necesidades",
    body: "Cada sector cuenta qué le falta en su operación: el problema que el mercado todavía no resuelve.",
  },
  {
    n: "02",
    title: "El Observatorio",
    body: "Esas respuestas se vuelven un mapa público y anónimo de lo que la industria del estado necesita.",
  },
  {
    n: "03",
    title: "Prototipado",
    body: "Startups y equipos construyen esa solución y la prueban con las empresas que la pidieron.",
  },
];

export function PxpStages() {
  return (
    <PxpFrame id="como-funciona">
      <header>
        <p className="pxp-kicker text-program-field">Cómo funciona</p>
        <h2 className="pxp-title mt-2 text-[clamp(1.35rem,6.8vw,2.75rem)]! leading-[1.15] text-ink">
          Del problema a la solución,
          <br />
          en tres etapas
        </h2>
        <span aria-hidden className="mt-3 block h-0.5 w-12 bg-program-field" />
      </header>
      <StageSequence>
          {stages.map((stage) => (
            <li
              key={stage.n}
              id={stage.n === "02" ? "observatorio" : undefined}
              className="stage-step relative scroll-mt-24 border-l border-program-field pl-5 lg:border-t lg:border-l-0 lg:pt-8 lg:pl-0"
            >
              <span aria-hidden className="absolute -top-3 left-0 hidden size-2.5 -translate-y-1/2 rounded-full bg-program-field lg:block" />
              <p className="font-display text-[2rem] leading-none font-bold text-program-field">{stage.n}</p>
              <h3 className="pxp-label mt-3 text-ink lg:min-h-14">{stage.title}</h3>
              <p className="mt-2 text-base leading-snug text-ink-secondary">{stage.body}</p>
            </li>
          ))}
      </StageSequence>
      <div className="mt-8 lg:mt-12">
        <PrivacyCallout />
      </div>
      <div className="mt-8">
        <CompanyCta />
      </div>
    </PxpFrame>
  );
}
