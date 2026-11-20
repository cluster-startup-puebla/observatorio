import { ProgramHowClose } from "./program-how-close";

const steps = [
  "La empresa expresa la necesidad en Foro Puebla x Puebla.",
  "Un equipo de desarrollo aporta la solución.",
  "El trabajo toma una de tres formas: piloto en operación real, codesarrollo (la empresa y el equipo construyen la salida juntos) o adopción de una tecnología ya probada.",
];

export function ProgramHow() {
  return (
    <section className="scroll-mt-24 border-t border-line">
      <div className="container-site py-16 lg:py-24">
        <h2 className="text-h2 max-w-3xl text-balance text-ink">Cómo</h2>
        <ol className="mt-6 grid max-w-[65ch] gap-4">
          {steps.map((step, index) => (
            <li key={step} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
              <span className="text-h4 text-ink">{index + 1}</span>
              <p className="text-body text-ink">{step}</p>
            </li>
          ))}
        </ol>
      </div>
      <ProgramHowClose />
    </section>
  );
}
