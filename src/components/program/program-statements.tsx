import { ProgramSection } from "./program-section";

const blocks = [
  {
    title: "Qué es",
    body: "El Observatorio Tecnológico documenta de forma sistemática las necesidades tecnológicas del Estado para exponer oportunidades de innovación en cada área. Reúne a más de 13 sectores. La plataforma sigue viva: una empresa responde en la sesión o desde su cuenta, cada año o cuando implementa una tecnología nueva.",
  },
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
          <p className="max-w-3xl text-body text-ink">{block.body}</p>
        </ProgramSection>
      ))}
    </>
  );
}
