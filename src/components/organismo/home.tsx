export function OrgHome({ slug, name }: { slug: string; name: string }) {
  return (
    <header className="grid gap-4">
      <h1 className="text-h1 text-ink">{name}</h1>
      <p className="text-body text-ink-secondary">Panel de {slug}</p>
      <button type="button" className="btn btn-primary" disabled>
        Copiar enlace del evento
      </button>
    </header>
  );
}
