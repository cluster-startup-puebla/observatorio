import Link from "next/link";

export function OrganismoNav() {
  return (
    <nav className="flex flex-wrap gap-3" aria-label="Organismo">
      <Link href="/organismo" className="btn btn-secondary px-4 py-2 text-small">
        Tablero
      </Link>
      <Link href="/organismo/crm" className="btn btn-secondary px-4 py-2 text-small">
        CRM
      </Link>
      <Link href="/organismo/analitica" className="btn btn-secondary px-4 py-2 text-small">
        Analítica
      </Link>
      <a href="/organismo/invitaciones/plantilla" className="text-small font-semibold text-link">
        Descargar plantilla
      </a>
    </nav>
  );
}
