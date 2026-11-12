function initials(name: string) {
  const letters = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "");
  return letters.join("") || "—";
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-24 rounded-xl border border-line bg-surface-subtle px-3 py-3 text-center">
      <div className="text-body font-semibold text-ink">{value}</div>
      <div className="text-small text-ink-secondary">{label}</div>
    </div>
  );
}

export function OrganismoHeader({
  name,
  logoUrl,
  color,
  brand,
  members,
  contacts,
  copies,
}: {
  name: string;
  logoUrl: string;
  color: string;
  brand: string;
  members: number;
  contacts: number;
  copies: number;
}) {
  return (
    <section className="rounded-2xl border border-line bg-elevated p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="size-20 shrink-0 rounded-2xl border border-line bg-surface-subtle object-contain" />
          ) : (
            <span className="grid size-20 shrink-0 place-items-center rounded-2xl border border-line bg-surface-subtle text-lg font-semibold text-ink">
              {initials(name)}
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-ink">{name}</h2>
            <p className="mt-1 text-small text-ink-secondary">{brand === "Lista" ? "Marca lista" : "Marca incompleta"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Stat label="Miembros" value={members} />
          <Stat label="Contactos" value={contacts} />
          <Stat label="Enlaces" value={copies} />
        </div>
      </div>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line px-4 py-3">
          <dt className="text-small text-ink-secondary">Color</dt>
          <dd className="mt-1 flex items-center gap-2 text-body text-ink">
            {color ? <span className="size-4 rounded-sm border border-line" style={{ backgroundColor: color }} /> : null}
            {color || "—"}
          </dd>
        </div>
        <div className="rounded-xl border border-line px-4 py-3">
          <dt className="text-small text-ink-secondary">Marca</dt>
          <dd className="mt-1 text-body text-ink">{brand}</dd>
        </div>
      </dl>
    </section>
  );
}
