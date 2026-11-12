function when(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function CorreosSection({ mail }: { mail: { id: string; subject: string | null; created_at: string }[] }) {
  if (!mail.length) return <p className="text-sm text-ink-secondary">Sin correos.</p>;
  return (
    <ul className="grid gap-2">
      {mail.map((row) => (
        <li key={row.id} className="flex items-baseline justify-between gap-4 rounded-xl border border-line bg-elevated px-4 py-3">
          <span className="text-body text-ink">{row.subject || "Correo"}</span>
          <span className="text-small text-ink-secondary">{when(row.created_at)}</span>
        </li>
      ))}
    </ul>
  );
}
