const filters = ["Sector", "Tamaño", "Giro", "Oportunidad"];
const samples = ["Muebles · Sistemas de trazabilidad", "Alimentos · Control de mermas"];

export function ObservatoryMock() {
  return (
    <figure className="mt-12 border border-line bg-sand p-6">
      <figcaption className="text-xs font-bold tracking-[0.14em] text-ink-muted uppercase">Ejemplo ilustrativo</figcaption>
      <ul className="mt-4 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <li key={filter} className="rounded-full border border-line bg-surface px-3 py-1 text-small text-ink">
            {filter}
          </li>
        ))}
      </ul>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {samples.map((sample) => (
          <li key={sample} className="border border-line bg-surface p-4 text-body font-bold text-ink">
            {sample}
          </li>
        ))}
      </ul>
    </figure>
  );
}
