export function PaseSection({ assetId }: { assetId: string | null }) {
  if (!assetId) return <p className="text-sm text-ink-secondary">Sin pase.</p>;
  return (
    <img
      src={`/api/admin/medios/${assetId}/archivo`}
      alt="QR del pase"
      className="h-48 w-48 rounded-lg border border-line bg-elevated object-contain"
    />
  );
}
