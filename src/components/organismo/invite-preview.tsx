import Link from "next/link";
import { Kicker } from "@/components/landing/atoms/kicker";
import { inviteLine } from "@/components/landing/sections/invite-intro";

function previewLine(sectorName: string | null, orgName: string) {
  if (sectorName) return inviteLine(sectorName, orgName);
  return `Empresa de tu sector, reciba una cordial invitación de ${orgName} para participar en el levantamiento de necesidades.`;
}

export function InvitePreview({
  orgName,
  sectorName,
  logoSrc,
  href,
}: {
  orgName: string;
  sectorName: string | null;
  logoSrc: string | null;
  href: string | null;
}) {
  return (
    <aside className="grid content-start gap-3 lg:sticky lg:top-0" aria-label="Vista de la invitación">
      <div className="grid gap-1">
        <h2 className="text-small font-semibold text-ink">Así se ve la invitación</h2>
        <p className="text-small text-ink-secondary">
          La ve quien abre el enlace. Crear invitación no la manda por correo: la persona queda
          pendiente en el CRM.
        </p>
      </div>
      <article
        data-testid="vista-invitacion"
        className="grid gap-4 rounded-lg border border-line bg-surface-subtle p-5"
      >
        {logoSrc ? (
          <img src={logoSrc} alt="" className="h-16 w-auto max-w-36 object-contain" />
        ) : (
          <p className="text-small font-semibold text-ink">{orgName}</p>
        )}
        <Kicker>Levantamiento de necesidades</Kicker>
        <p className="text-body font-semibold text-balance text-ink">{previewLine(sectorName, orgName)}</p>
        <p className="text-small text-ink-secondary">
          Participa en la sesión de tu sector y ayuda a construir el primer Observatorio Tecnológico
          del estado.
        </p>
        <span className="btn btn-primary pointer-events-none w-fit" aria-hidden="true">
          Reservar mi lugar
        </span>
      </article>
      {href ? (
        <Link className="text-small font-semibold text-link" href={href}>
          Abrir el enlace
        </Link>
      ) : (
        <p className="text-small text-ink-secondary">
          El sector sale del enlace que generas en Inicio.
        </p>
      )}
    </aside>
  );
}
