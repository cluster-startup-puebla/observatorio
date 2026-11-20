import { Factory, Ruler, Sparkles } from "lucide-react";
import { CompanyCta, DurationPill } from "./bits";
import { PxpFrame } from "./frame";
import { PxpHeading } from "./heading";

const cards = [
  { icon: Factory, label: "Industria" },
  { icon: Ruler, label: "Tamaño" },
  { icon: Sparkles, label: "Oportunidad" },
];

export function PxpListen() {
  return (
    <PxpFrame id="levantamiento" tone="sand">
      <div className="grid items-start gap-10 lg:grid-cols-[2fr_3fr]">
        <div>
          <p className="font-serif text-8xl leading-none text-program-x">01</p>
          <div className="mt-4">
            <DurationPill>2 meses de trabajo</DurationPill>
          </div>
        </div>
        <div>
          <PxpHeading eyebrow="Etapa 01" title="Tu empresa dice qué le hace falta" />
          <p className="mt-6 text-body text-ink">
            El Clúster opera y las cámaras convocan. En sesiones de escucha estructurada, tú expresas tus necesidades y requisitos técnicos reales. No buscamos obviedades: buscamos los problemas que el mercado no resuelve.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {cards.map((card) => (
              <li key={card.label} className="border border-line bg-surface px-4 py-5 text-center">
                <card.icon aria-hidden className="mx-auto text-program-field" size={22} />
                <p className="mt-3 font-bold text-ink">{card.label}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-body text-ink">
            Cada hallazgo se clasifica por estas tres dimensiones. El resultado es un diagnóstico tecnológico especializado de tu sector.
          </p>
          <div className="mt-8">
            <CompanyCta>Crear cuenta y registrar mi necesidad</CompanyCta>
            <p className="mt-3 text-small text-ink-secondary">Sin costo. Tu información se usa de forma anónima.</p>
          </div>
        </div>
      </div>
    </PxpFrame>
  );
}
