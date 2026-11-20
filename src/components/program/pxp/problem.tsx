import { PxpFrame } from "./frame";
import { PxpHeading, PxpItalic } from "./heading";
import { Reveal } from "./reveal";

const points = [
  { id: "demanda", text: <>La <strong>demanda tecnológica</strong> de la industria no se documenta de forma sistemática.</> },
  { id: "capital", text: <>El <strong>capital</strong> existe, pero está disperso y <span className="font-semibold">distraído</span>.</> },
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
            <li key={point.id} className="bg-surface p-6 pxp-copy text-ink">
              {point.text}
            </li>
          ))}
        </ul>
      </Reveal>
    </PxpFrame>
  );
}
