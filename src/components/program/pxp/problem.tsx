import { PxpFrame } from "./frame";
import { PxpHeading, PxpItalic } from "./heading";
import { Reveal } from "./reveal";

const points = [
  { id: "demanda", text: <>La <strong>demanda tecnológica</strong> de la industria no se documenta de forma sistemática.</> },
  { id: "capital", text: <>El <strong>capital</strong> existe, pero está disperso y <em>distraído</em>.</> },
  { id: "ciegas", text: <>Los <strong>emprendedores</strong> construyen a ciegas, sin visibilidad de la demanda real.</> },
  { id: "resultados", text: <>Muchas iniciativas, pocos <strong>resultados</strong>.</> },
];

export function PxpProblem() {
  return (
    <PxpFrame id="problema">
      <Reveal>
        <PxpHeading eyebrow="El problema que todos conocemos" title={<>Puebla es fuerte, pero su ecosistema está <PxpItalic>desarticulado</PxpItalic></>} />
        <ul className="mt-12 grid gap-px bg-line sm:grid-cols-2">
          {points.map((point) => (
            <li key={point.id} className="bg-surface p-6 text-body text-ink">
              {point.text}
            </li>
          ))}
        </ul>
        <p className="mt-12 max-w-[28ch] font-serif text-[clamp(1.75rem,3vw,2.5rem)] leading-tight text-ink italic">
          Hay mucho esfuerzo valioso, pero aislado. Falta colaboración y dirección.
        </p>
      </Reveal>
    </PxpFrame>
  );
}
