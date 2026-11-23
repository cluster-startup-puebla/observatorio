export function FichaTab({
  audience,
  includes,
  formatName,
  modality,
  kind,
  instrumentId,
}: {
  audience: string;
  includes: string;
  formatName: string;
  modality: string;
  kind: string;
  instrumentId: string | null;
}) {
  return (
    <dl className="grid gap-2 text-small">
      <div>
        <dt className="text-ink-muted">Formato</dt>
        <dd>{formatName}</dd>
      </div>
      <div>
        <dt className="text-ink-muted">Tipo</dt>
        <dd>{modality}</dd>
      </div>
      <div>
        <dt className="text-ink-muted">Plantilla</dt>
        <dd>{kind}</dd>
      </div>
      <div>
        <dt className="text-ink-muted">Instrumento</dt>
        <dd>{instrumentId || "Por sector"}</dd>
      </div>
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
