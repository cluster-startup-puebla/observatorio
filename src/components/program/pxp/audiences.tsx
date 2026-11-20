import Link from "next/link";
import { companyAccountHref, teamAccountHref } from "@/content/landing";
import { PxpFrame } from "./frame";

const company = [
  "Declara los retos tecnológicos de tu operación.",
  "Recibe soluciones de startups y equipos poblanos, validadas contigo.",
  "Actualiza tu necesidad cada año o cada vez que implementes una tecnología nueva.",
];

const teams = [
  "Conoce problemas reales de la industria.",
  "Valida tu solución con clientes reales desde el inicio.",
  "Llega a piloto, codesarrollo o adopción.",
];

export function PxpAudiences() {
  return (
    <PxpFrame id="para-quien" tone="sand">
      <h2 className="text-center text-[clamp(2rem,4vw,3.25rem)] leading-tight font-extrabold text-ink">
        Dos lados, una misma conversación
      </h2>
      <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="border-2 border-program-field bg-surface p-8">
          <h3 className="text-h3 text-ink">Para empresas</h3>
          <ul className="mt-4 space-y-3 text-body text-ink">
            {company.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link href={companyAccountHref} className="btn mt-8 w-full bg-program-field text-white sm:w-fit">
            Crear cuenta
          </Link>
        </article>
        <article className="border border-line bg-surface p-8">
          <h3 className="text-h3 text-ink">Para startups y equipos de desarrollo</h3>
          <ul className="mt-4 space-y-3 text-body text-ink">
            {teams.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link href={teamAccountHref} className="btn mt-8 w-full border border-program-field bg-transparent text-program-field sm:w-fit">
            Soy equipo de desarrollo
          </Link>
        </article>
      </div>
    </PxpFrame>
  );
}
