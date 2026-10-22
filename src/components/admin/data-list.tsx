export function DataList({
  title,
  lead,
  columns,
  rows,
  page,
  basePath,
  error,
  children,
}: {
  title: string;
  lead: string;
  columns: { key: string; label: string }[];
  rows: Record<string, string>[];
  page: number;
  basePath: string;
  error?: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="px-8 py-8">
      <h1 className="text-h1 text-ink">{title}</h1>
      <p className="mt-2 max-w-2xl text-body text-ink-secondary">{lead}</p>
      {error ? <p className="mt-4 text-small text-mark">{error}</p> : null}
      {children}
      {rows.length === 0 ? <p className="mt-8 text-body text-ink">Sin filas.</p> : null}
      {rows.length > 0 ? (
        <table className="mt-8 w-full text-left">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-2 py-2 text-small text-ink-secondary">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-line">
                {columns.map((column) => (
                  <td key={column.key} className="px-2 py-3 text-body text-ink">
                    {row[column.key] ?? ""}
                  </td>
                ))}
                <td className="px-2 py-3">
                  <a className="text-link" href={`${basePath}/${row.id}`}>
                    Abrir
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      <p className="mt-4 text-small text-ink-secondary" data-testid="pagina">
        {page}
      </p>
      {page > 1 ? <a href={`${basePath}?page=${page - 1}`}>Anterior</a> : null}
      <a className="ml-4 text-link" href={`${basePath}?page=${page + 1}`}>
        Siguiente
      </a>
    </main>
  );
}
