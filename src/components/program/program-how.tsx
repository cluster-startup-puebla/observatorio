import Link from "next/link";
import { ProgramSection } from "./program-section";

const steps = [
  "La empresa expresa la necesidad en el Observatorio.",
  "Un equipo de desarrollo aporta la solución.",
  "El trabajo toma una de tres formas: piloto en operación real, codesarrollo, o adopción de una tecnología ya probada.",
];

const forms = ["Piloto en operación real", "Codesarrollo", "Adopción de una tecnología ya probada"];

export function ProgramHow() {
  return (
    <ProgramSection title="Cómo">
      <ol className="grid max-w-3xl gap-4">
        {steps.map((step, index) => (
          <li key={step} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
            <span className="text-h4 text-ink">{index + 1}</span>
            <p className="text-body text-ink">{step}</p>
          </li>
        ))}
      </ol>
      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {forms.map((form) => (
          <li key={form} className="border border-line px-4 py-3 text-small text-ink">
            {form}
          </li>
        ))}
      </ul>
      <Link href="/crear-cuenta" className="btn btn-primary mt-8">
        Crear cuenta
      </Link>
    </ProgramSection>
  );
}
