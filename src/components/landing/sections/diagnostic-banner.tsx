import { ArrowUpRight } from "lucide-react";

export function DiagnosticBanner() {
  return (
    <aside data-testid="bloque-via-partners" className="border-b border-line bg-surface-subtle">
      <div className="container-site flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-6">
        <div className="grid gap-1">
          <p className="text-h4 text-ink">Puebla ante el T-MEC</p>
          <p className="max-w-2xl text-body text-ink-secondary">
            Cifras, gráficas y la estrategia del diagnóstico de VIA Partners. Para quien quiere
            leerlo antes de la sesión.
          </p>
        </div>
        <a
          href="/diagnostico-tmec-puebla"
          className="inline-flex min-h-11 shrink-0 items-center gap-1 self-start text-body font-semibold text-link sm:self-center"
        >
          Leer el diagnóstico
          <ArrowUpRight size={18} aria-hidden />
        </a>
      </div>
    </aside>
  );
}
