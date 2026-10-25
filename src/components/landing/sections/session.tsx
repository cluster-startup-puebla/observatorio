import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/landing/molecules/section-heading";
import { program } from "@/content/session-program";
import { sessionFacts } from "@/content/landing";

const quintaRealMap = "https://maps.app.goo.gl/Dzgq3VtHbAPJT4U58";

export function Session() {
  return (
    <section id="sesion" data-testid="bloque-evento" className="scroll-mt-24 container-site py-20 lg:py-28">
      <SectionHeading title="Estrategia estatal de vinculación industrial con el ecosistema de innovación." />
      <dl className="mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
        {sessionFacts.map((fact) => (
          <div key={fact.label} className="bg-surface p-6">
            <dt className="text-micro uppercase text-ink-muted">{fact.label}</dt>
            <dd className="text-body mt-2 text-ink">
              {fact.label === "Dónde" ? (
                <a
                  href={quintaRealMap}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-link"
                >
                  {fact.value}
                  <ArrowUpRight size={16} aria-hidden />
                  <span className="sr-only">, se abre en otra pestaña</span>
                </a>
              ) : (
                fact.value
              )}
            </dd>
          </div>
        ))}
      </dl>
      <ol className="mt-12 max-w-3xl border-t border-line">
        {program.map((item) => (
          <li key={item.time} className="grid gap-2 border-b border-line py-6 sm:grid-cols-[8.5rem_1fr] sm:gap-8">
            <p className="text-small font-semibold text-ink">{item.time}</p>
            <div>
              <h3 className="text-h4 text-ink">{item.name}</h3>
              {item.who ? <p className="text-small mt-2 text-ink-secondary">{item.who}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
