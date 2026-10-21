import { Kicker } from "@/components/landing/atoms/kicker";
import { copyEventLinkAction } from "@/lib/organismo-actions";

export const instant = false;

export default function OrganismoHome() {
  return (
    <header className="grid max-w-3xl gap-4">
      <Kicker>Organismo</Kicker>
      <h1 className="text-h1 text-ink">Tu evento</h1>
      <p className="text-body-lg text-ink-secondary">
        Carga invitaciones, copia el enlace y mira quién ya está en el CRM.
      </p>
      <form action={copyEventLinkAction}>
        <button type="submit" className="btn btn-primary">
          Copiar enlace del evento
        </button>
      </form>
    </header>
  );
}
