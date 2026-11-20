import Link from "next/link";

const METAL: Record<string, { wash: string; ink: string }> = {
  Bronce: { wash: "var(--medal-bronce-wash)", ink: "var(--medal-bronce)" },
  Plata: { wash: "var(--medal-plata-wash)", ink: "var(--medal-plata)" },
  Oro: { wash: "var(--medal-oro-wash)", ink: "var(--medal-oro)" },
  Platino: { wash: "var(--medal-platino-wash)", ink: "var(--medal-platino)" },
};

export function ResultNote({
  shown,
  together,
  band,
  reportHref,
}: {
  shown: number;
  together: boolean;
  band: string | null;
  reportHref?: string;
}) {
  const metal = band ? METAL[band] : { wash: "var(--accent-soft)", ink: "var(--brand-secondary)" };
  return (
    <section
      className="space-y-3 rounded-3xl px-4 py-8 text-center"
      style={{ backgroundColor: metal.wash, color: metal.ink }}
    >
      {band ? (
        <div
          className="mx-auto flex size-16 items-center justify-center rounded-full"
          style={{ backgroundColor: metal.ink, color: metal.wash }}
        >
          <MedalStar />
        </div>
      ) : null}
      {band ? <p className="text-sm font-medium">{band}</p> : null}
      <p className="text-5xl font-semibold tabular-nums tracking-tight">{shown.toFixed(2)}</p>
      <p className="text-base font-medium">{together ? "Madurez de conjunto" : "Madurez que reportas"}</p>
      <p className="mx-auto max-w-sm text-sm leading-relaxed opacity-80">
        {together
          ? "Esta es la nota de la empresa. Junta lo que dice la dirección con lo que se ve en la operación."
          : "Esta es la nota de lo que ve la dirección. Todavía no se junta con la operación."}
      </p>
      {reportHref ? (
        <Link href={reportHref} className="btn btn-primary">
          Ver el reporte
        </Link>
      ) : null}
    </section>
  );
}

function MedalStar() {
  return (
    <svg viewBox="0 0 24 24" className="size-9" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M11.051 7.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.867l-1.156-1.152a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z" />
    </svg>
  );
}
