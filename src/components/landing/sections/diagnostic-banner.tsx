import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function DiagnosticBanner({ closing = false }: { closing?: boolean }) {
  return (
    <aside
      data-testid="bloque-via-partners"
      className={closing ? "flex flex-1 flex-col justify-center bg-surface-subtle" : "border-b border-line bg-surface-subtle"}
    >
      <div
        className={
          closing
            ? "container-site flex flex-col gap-6 py-16 sm:flex-row sm:items-end sm:justify-between lg:py-24"
            : "container-site flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:py-6"
        }
      >
        <div className={closing ? "grid max-w-2xl gap-3" : "grid gap-1"}>
          <p className={closing ? "text-h2 text-balance text-ink" : "text-h4 text-ink"}>Puebla ante el T-MEC</p>
          <p className="max-w-2xl text-body text-ink-secondary">
            Cifras, gráficas y la estrategia del diagnóstico de VIA Partners. Para quien quiere
            leerlo antes de la sesión.
          </p>
        </div>
        <Link
          href="/diagnostico-tmec-puebla"
          className={`inline-flex min-h-11 shrink-0 items-center gap-1 self-start text-body font-semibold text-link ${closing ? "sm:self-end" : "sm:self-center"}`}
        >
          Leer el diagnóstico
          <ArrowUpRight size={18} aria-hidden />
        </Link>
      </div>
    </aside>
  );
}
