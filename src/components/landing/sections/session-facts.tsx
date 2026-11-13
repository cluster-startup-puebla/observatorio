import { ArrowUpRight } from "lucide-react";
import { sessionFacts } from "@/content/landing";

const quintaRealMap = "https://maps.app.goo.gl/Dzgq3VtHbAPJT4U58";

const compactLabels = new Set(["Dónde", "Horario"]);

export function SessionFacts({ compact = false }: { compact?: boolean }) {
  const facts = compact ? sessionFacts.filter((fact) => compactLabels.has(fact.label)) : sessionFacts;
  return (
    <dl className={listClass(compact)}>
      {facts.map((fact) => (
        <div key={fact.label} className={compact ? "min-w-0" : "min-w-0 bg-surface-subtle p-6"}>
          <dt className="text-micro uppercase text-ink-muted">{fact.label}</dt>
          <dd className={valueClass(compact, fact.label)}>
            {fact.label === "Dónde" ? <Place compact={compact} value={fact.value} /> : fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function listClass(compact: boolean) {
  if (compact) return "mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2";
  return "mt-12 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3";
}

function valueClass(compact: boolean, label: string) {
  if (compact) return "mt-1 text-small break-words text-ink";
  if (label === "Horario" || label === "Grupo") return "mt-2 text-h3 text-balance text-ink";
  return "mt-2 break-words text-body text-ink";
}

function Place({ compact, value }: { compact: boolean; value: string }) {
  return (
    <a
      href={quintaRealMap}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-full items-center gap-1 break-words text-link"
    >
      {value}
      <ArrowUpRight size={compact ? 14 : 16} className="shrink-0" aria-hidden />
      <span className="sr-only">, se abre en otra pestaña</span>
    </a>
  );
}
