export function RespuestasSection({ lines }: { lines: { key: string; prompt: string; label: string }[] }) {
  if (!lines.length) return <p className="text-sm text-ink-secondary">Sin respuestas.</p>;
  return (
    <ul className="divide-y divide-line rounded-lg border border-line">
      {lines.map((line) => (
        <li key={line.key} className="px-4 py-3 text-sm text-ink">
          {line.prompt ? <span className="text-ink-secondary">{line.prompt}: </span> : null}
          <span className="font-medium">{line.label}</span>
        </li>
      ))}
    </ul>
  );
}
