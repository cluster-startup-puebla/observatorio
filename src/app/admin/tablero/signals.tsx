import { convocatoriaSignals } from "@/lib/admin/tablero/reading";
import type { Tablero } from "@/lib/admin/tablero/types";

export function TableroSignals({ board }: { board: Tablero }) {
  const items = convocatoriaSignals(board);
  const columns = items.length > 1 ? "lg:grid-cols-3" : "";
  return (
    <section className={`grid gap-3 ${columns}`} data-testid="tablero-decisiones">
      {items.map((item) => (
        <a key={item.text} href={item.href} className="rounded-2xl border border-line bg-elevated p-4">
          <p className="text-small text-ink">{item.text}</p>
          <span className="mt-3 inline-block text-small text-link">{item.label}</span>
        </a>
      ))}
    </section>
  );
}
