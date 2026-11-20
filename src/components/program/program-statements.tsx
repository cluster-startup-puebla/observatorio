import { ProgramSection } from "./program-section";

const blocks = [
  {
    title: "Objetivo",
    body: "Incrementar la competitividad del Estado a través de la inserción de la tecnología en la industria, y acompañar a cada empresa a su siguiente nivel de competitividad.",
  },
  {
    title: "Por qué",
    body: "Hoy la industria local no tiene solución para sus problemas específicos, y las startups construyen ideas sin validación. Puebla x Puebla las acerca.",
  },
];

export function ProgramStatements() {
  return (
    <>
      {blocks.map((block) => (
        <ProgramSection key={block.title} title={block.title}>
          <p className="max-w-[65ch] text-body text-ink">{block.body}</p>
        </ProgramSection>
      ))}
    </>
  );
}
