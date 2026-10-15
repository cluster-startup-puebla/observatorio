export function LegalArticle({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <article className="container-site max-w-3xl py-16 lg:py-20">
      <h1 className="text-h1 text-balance text-ink">{title}</h1>
      <p className="text-small mt-3 text-ink-muted">Actualizado el {updated}.</p>
      <div className="text-body mt-8 space-y-4 text-ink-secondary">{children}</div>
    </article>
  );
}

export function LegalHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-h3 mt-10 text-ink">{children}</h2>;
}
