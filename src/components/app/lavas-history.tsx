type HistoryRow = {
  id: string;
  action_code: string;
  amount: number;
  origen: string;
  created_at: string;
  note: string | null;
};

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function LavasHistory({ rows }: { rows: HistoryRow[] }) {
  if (rows.length === 0) {
    return <p className="text-small text-ink-secondary">Todavía no tienes movimientos.</p>;
  }
  return (
    <ul className="grid gap-2">
      {rows.map((row) => (
        <li key={row.id} className="flex items-baseline justify-between gap-3 border-b border-line/60 py-2 text-small">
          <div className="min-w-0">
            <p className="font-medium text-ink">{row.action_code}</p>
            <p className="text-ink-secondary">{formatWhen(row.created_at)}</p>
            {row.note ? <p className="text-ink-secondary">{row.note}</p> : null}
          </div>
          <p className="shrink-0 font-semibold text-ink">
            {row.amount > 0 ? `+${row.amount}` : row.amount}
          </p>
        </li>
      ))}
    </ul>
  );
}
