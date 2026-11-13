import { ArrowUpRight } from "lucide-react";
import { sessionFacts } from "@/content/landing";

const quintaRealMap = "https://maps.app.goo.gl/Dzgq3VtHbAPJT4U58";

export function SessionFacts() {
  return (
    <dl className="mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
      {sessionFacts.map((fact) => (
        <div key={fact.label} className="bg-surface-subtle p-6">
          <dt className="text-micro uppercase text-ink-muted">{fact.label}</dt>
          <dd
            className={
              fact.label === "Horario" || fact.label === "Grupo"
                ? "text-h3 mt-2 text-balance text-ink"
                : "text-body mt-2 text-ink"
            }
          >
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
  );
}
