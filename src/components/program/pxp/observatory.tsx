import { DurationPill, PrivacyCallout } from "./bits";
import { PxpFrame } from "./frame";
import { PxpHeading } from "./heading";
import { ObservatoryMock } from "./observatory-mock";

const cards = [
  { label: "Industria", text: "Un diagnóstico de tu sector." },
  { label: "Emprendedores", text: "La visibilidad de qué vale la pena construir." },
  { label: "Estado", text: "La base para diseñar políticas públicas diferenciadas." },
  { label: "Cámaras", text: "Acceso premium para análisis de datos." },
];

export function PxpObservatory() {
  return (
    <PxpFrame id="observatorio">
      <PxpHeading eyebrow="Etapa 02" title="El Observatorio: lo que Puebla necesita, a la vista" />
      <p className="mt-6 max-w-[58ch] text-body text-ink">
        Es el reporte <strong>vivo, público y compartido</strong> de la demanda tecnológica del estado. Un mapa de las oportunidades tecnológicas, siempre actualizado.
      </p>
      <div className="mt-8 max-w-3xl">
        <PrivacyCallout />
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <li key={card.label} className="border-t-2 border-program-field bg-surface pt-4">
            <p className="text-xs font-bold tracking-[0.14em] text-program-field uppercase">{card.label}</p>
            <p className="mt-2 text-body text-ink">{card.text}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <DurationPill>20 días de trabajo</DurationPill>
      </div>
      <ObservatoryMock />
    </PxpFrame>
  );
}
