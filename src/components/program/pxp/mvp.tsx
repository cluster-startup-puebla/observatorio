import { Callout, DurationPill } from "./bits";
import { PxpFrame } from "./frame";
import { PxpHeading } from "./heading";

const benefits = [
  "Responde a una necesidad real y la validan quienes la expresaron.",
  "Se crea valor y tracción de manera local con visión global.",
  "Las EIA que participen ganan ventaja competitiva.",
];

export function PxpMvp() {
  return (
    <PxpFrame id="mvp">
      <div className="grid items-start gap-10 lg:grid-cols-[2fr_3fr]">
        <div>
          <p className="font-serif text-8xl leading-none text-program-x">03</p>
          <div className="mt-4">
            <DurationPill>5 meses</DurationPill>
          </div>
        </div>
        <div>
          <PxpHeading eyebrow="Etapa 03" title="Prototipado (MVP): validar con el mercado real" />
          <p className="mt-6 text-body text-ink">
            Con el Observatorio publicado, las oportunidades, las startups y las empresas de innovación abierta (EIA) desarrollan y pivotean soluciones a necesidades reales. Es la vinculación de la <strong>industria local</strong> con las <strong>startups del futuro</strong>.
          </p>
          <div className="mt-6">
            <Callout>
              <strong>Nuestro compromiso clave:</strong> cada startup es incubada al validar su solución con <strong>al menos 2 empresas</strong> que participaron en el levantamiento.
            </Callout>
          </div>
          <ul className="mt-8 grid gap-4 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="border-t-2 border-program-field pt-4 text-body text-ink">
                {benefit}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-small text-ink-secondary italic">
            Las soluciones más viables se acercan a opciones de financiamiento.
          </p>
        </div>
      </div>
    </PxpFrame>
  );
}
