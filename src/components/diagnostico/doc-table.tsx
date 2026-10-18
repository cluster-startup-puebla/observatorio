export function DocTable({
  label,
  title,
  columns,
  rows,
  source,
}: {
  label: string;
  title: string;
  columns: string[];
  rows: string[][];
  source: string;
}) {
  return (
    <figure className="grid gap-3">
      <figcaption className="grid gap-1">
        <span className="text-small text-ink-muted">{label}</span>
        <span className="text-h4 text-ink">{title}</span>
      </figcaption>
      <div className="doc-table-stack">
        {rows.map((row) => (
          <article key={row[0]} className="grid gap-4 border border-line bg-surface p-4">
            {row.map((cell, index) => (
              <div key={`${row[0]}-${columns[index]}`} className="grid gap-1">
                <p className="text-small text-ink-muted">{columns[index]}</p>
                <p
                  className={
                    index === 0
                      ? "text-body font-semibold leading-relaxed text-ink"
                      : "text-body leading-relaxed text-ink-secondary"
                  }
                >
                  {cell}
                </p>
              </div>
            ))}
          </article>
        ))}
      </div>
      <div className="doc-table-wide">
        <table className="w-full min-w-[40rem] border-collapse text-left text-small">
          <thead className="bg-navy text-on-brand">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="border-t border-line odd:bg-surface even:bg-surface-subtle">
                {row.map((cell, index) => (
                  <td key={`${row[0]}-${index}`} className="px-4 py-3 align-top text-ink-secondary">
                    <span className={index === 0 ? "font-semibold text-ink" : undefined}>{cell}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-small text-ink-muted">{source}</p>
    </figure>
  );
}
