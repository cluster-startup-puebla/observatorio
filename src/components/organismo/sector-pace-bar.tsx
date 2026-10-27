import { loadSectorPace } from "@/lib/organismo/load-sector-pace";

export async function SectorPaceBar({ slug, name }: { slug: string; name: string }) {
  const pace = await loadSectorPace(slug);
  if (!pace.open) {
    return <p className="text-small text-ink-secondary">Esta sesión no tiene cupo para este sector.</p>;
  }
  const minePct = (pace.mine / pace.capacity) * 100;
  const othersPct = (pace.others / pace.capacity) * 100;
  return (
    <section className="grid gap-3" data-testid="sector-pace">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-h3 text-ink">{name}</h2>
        <p className="text-small tabular-nums text-ink">
          {pace.filled}/{pace.capacity} · {pace.free} lugares
        </p>
      </div>
      <div className="flex h-3 overflow-hidden rounded-full bg-surface-subtle" aria-hidden="true">
        <div style={{ width: `${minePct}%`, background: "var(--brand-primary)" }} />
        <div style={{ width: `${othersPct}%`, background: "var(--brand-secondary)" }} />
      </div>
      <ul className="flex flex-wrap gap-4 text-small text-ink-secondary">
        <li className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: "var(--brand-primary)" }} aria-hidden="true" />
          De este organismo
        </li>
        <li className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: "var(--brand-secondary)" }} aria-hidden="true" />
          De los demás
        </li>
      </ul>
    </section>
  );
}
