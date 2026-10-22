export function FichaTab({ audience, includes }: { audience: string; includes: string }) {
  return (
    <dl className="grid gap-2 text-small">
      <div>
        <dt className="text-ink-muted">Público</dt>
        <dd>{audience}</dd>
      </div>
      <div>
        <dt className="text-ink-muted">Incluye</dt>
        <dd>{includes}</dd>
      </div>
    </dl>
  );
}
