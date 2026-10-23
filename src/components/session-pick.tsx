export function SessionPick({
  sessions,
  className,
}: {
  sessions: { id: string; label: string }[];
  className?: string;
}) {
  if (sessions.length === 0) return null;
  const only = sessions.length === 1 ? sessions[0].id : "";
  return (
    <label className="grid gap-1 text-small text-ink-secondary">
      Sesión
      <select
        name="session_id"
        required
        defaultValue={only}
        className={className ?? "min-w-48 rounded-lg border border-line bg-elevated px-3 py-2 text-ink"}
      >
        {only ? null : <option value="">Elige una sesión</option>}
        {sessions.map((session) => (
          <option key={session.id} value={session.id}>
            {session.label}
          </option>
        ))}
      </select>
    </label>
  );
}
