export function SectorSection({
  id,
  source_label,
  acceptor,
  sector_source,
  admitted_at,
  has_link,
}: {
  id: string;
  source_label: string;
  acceptor: string;
  sector_source: string;
  admitted_at: string | null;
  has_link: boolean;
}) {
  return (
    <div className="space-y-4">
      <ul className="divide-y divide-line rounded-lg border border-line">
        <li className="px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-ink-secondary">Cómo llegó</p>
          <p className="text-sm font-medium break-words text-ink">{source_label || "—"}</p>
        </li>
        <li className="px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-ink-secondary">La acepta</p>
          <p className="text-sm font-medium break-words text-ink">{acceptor || "—"}</p>
        </li>
      </ul>
      {sector_source === "path" && !admitted_at && !has_link ? (
        <form action={`/api/admin/empresas/${id}/aceptar`} method="post">
          <button className="btn btn-primary" type="submit">
            Aceptar
          </button>
        </form>
      ) : null}
    </div>
  );
}
