export function PaseSection({ issued }: { issued: boolean }) {
  return (
    <ul className="rounded-lg border border-line">
      <li className="px-4 py-3 text-sm font-medium text-ink">{issued ? "Pase emitido." : "Sin pase."}</li>
    </ul>
  );
}
