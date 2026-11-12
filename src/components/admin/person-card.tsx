import Link from "next/link";

export function PersonCard({
  mark,
  title,
  line,
  href,
  hrefLabel,
  note,
  stat,
  statLabel,
}: {
  mark: React.ReactNode;
  title: string;
  line?: string;
  href?: string;
  hrefLabel?: string;
  note?: React.ReactNode;
  stat: string;
  statLabel: string;
}) {
  return (
    <section className="rounded-2xl border border-line bg-elevated p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid size-20 shrink-0 place-items-center rounded-2xl border border-line bg-surface-subtle text-lg font-semibold text-ink">
            {mark}
          </span>
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-ink">{title}</h2>
            {line ? <p className="mt-1 text-small text-ink-secondary">{line}</p> : null}
            {href && hrefLabel ? (
              <Link href={href} className="mt-1 inline-block text-small text-link">
                {hrefLabel}
              </Link>
            ) : hrefLabel ? (
              <p className="mt-1 text-small text-ink-secondary">{hrefLabel}</p>
            ) : null}
            {note ? <div className="mt-2">{note}</div> : null}
          </div>
        </div>
        <div className="min-w-24 rounded-xl border border-line bg-surface-subtle px-3 py-3 text-center">
          <div className="text-body font-semibold text-ink">{stat}</div>
          <div className="text-small text-ink-secondary">{statLabel}</div>
        </div>
      </div>
    </section>
  );
}
