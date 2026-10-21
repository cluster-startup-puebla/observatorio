import { InviteUpload } from "@/components/organismo/invite-upload";

export function OrganismoNav() {
  return (
    <div className="grid gap-8">
      <nav className="flex flex-wrap gap-3" aria-label="Organismo">
        <a href="/organismo" className="btn btn-secondary px-4 py-2 text-small">
          Tablero
        </a>
        <a href="/organismo/crm" className="btn btn-secondary px-4 py-2 text-small">
          CRM
        </a>
        <a href="/organismo/analitica" className="btn btn-secondary px-4 py-2 text-small">
          Analítica
        </a>
        <a href="/organismo/invitaciones/plantilla" className="text-small font-semibold text-link">
          Descargar plantilla
        </a>
      </nav>
      <InviteUpload />
    </div>
  );
}
