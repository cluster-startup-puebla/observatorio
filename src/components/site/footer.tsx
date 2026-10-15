import { clusterEmail, clusterUrl } from "@/content/landing";

const LINKS = [
  { label: "Cómo funciona", href: "/#como" },
  { label: "La sesión", href: "/#sesion" },
  { label: "Reservar", href: "/register" },
  { label: "Aviso de privacidad", href: "/aviso-de-privacidad" },
  { label: "Uso de datos", href: "/uso-de-datos" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface-subtle py-16">
      <div className="container-site grid gap-12 md:grid-cols-3">
        <div>
          <a href="/#inicio" className="font-display text-h4 text-ink">
            Observatorio
          </a>
          <p className="mt-4 max-w-sm text-small text-ink-secondary">
            Es una iniciativa del{" "}
            <a href={clusterUrl} className="text-link" target="_blank" rel="noopener noreferrer">
              Clúster de Startups e Innovación
            </a>
            .
          </p>
        </div>

        <div>
          <p className="text-micro uppercase text-ink-muted">Contacto</p>
          <a href={`mailto:${clusterEmail}`} className="mt-3 inline-block text-small text-link">
            {clusterEmail}
          </a>
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

      <div className="container-site mt-12 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-micro text-ink-muted">© 2026 Observatorio Tecnológico de Puebla</p>
        <p className="text-micro">
          <a href="/aviso-de-privacidad" className="text-link">
            Aviso de privacidad
          </a>
          <span className="px-2 text-ink-muted" aria-hidden>
            ·
          </span>
          <a href="/uso-de-datos" className="text-link">
            Uso de datos
          </a>
        </p>
      </div>
    </footer>
  );
}
