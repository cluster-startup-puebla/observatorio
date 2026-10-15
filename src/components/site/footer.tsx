const LINKS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Lectura", href: "#lectura" },
  { label: "Cómo", href: "#como" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface-subtle py-16">
      <div className="container-site grid gap-12 md:grid-cols-3">
        <div>
          <a href="#inicio" className="font-display text-h4 text-ink">
            Observatorio
          </a>
          <p className="mt-4 max-w-xs text-small text-ink-secondary">
            Composición del estudio, color del clúster.
          </p>
        </div>

        <div>
          <p className="text-micro uppercase text-ink-muted">Lugar</p>
          <p className="mt-3 text-small text-ink-secondary">México</p>
        </div>

        <div>
          <p className="text-micro uppercase text-ink-muted">En esta página</p>
          <ul className="mt-3 space-y-2 text-small">
            {LINKS.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-link">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-site mt-12 border-t border-line pt-6">
        <p className="text-micro text-ink-muted">© 2026 Observatorio</p>
      </div>
    </footer>
  );
}
