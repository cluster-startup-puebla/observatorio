import type { ReactNode } from "react";

export function ChartPanel({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-elevated p-5">
      <h2 className="text-h4 text-ink">{title}</h2>
      <p className="mt-1 text-small text-ink-secondary">{hint}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}
