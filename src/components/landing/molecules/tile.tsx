export function Tile({ title, description }: { title: string; description: string }) {
  return (
    <article className="bg-surface p-6">
      <h3 className="text-h4 text-ink">{title}</h3>
      <p className="text-small mt-3 text-ink-secondary">{description}</p>
    </article>
  );
}
