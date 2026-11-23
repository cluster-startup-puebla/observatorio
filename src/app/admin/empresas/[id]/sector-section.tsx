import Link from "next/link";
import { ActionButton } from "@/components/ui/action-button";

export function SectorSection({
  id,
  source_label,
  acceptor,
  conveners,
  admitted_at,
}: {
  id: string;
  source_label: string;
  acceptor: string;
  conveners: { name: string; href: string }[];
  sector_source: string;
  admitted_at: string | null;
  has_link: boolean;
}) {
  return (
    <div className="space-y-4">
      <ul className="divide-y divide-line rounded-lg border border-line">
        <li className="px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-ink-secondary">Cómo llegó</p>
          <p className="text-sm font-medium break-words text-ink">{source_label || "—"}</p>
        </li>
        <li className="px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-ink-secondary">La acepta</p>
          {conveners.length ? (
            <p className="text-sm font-medium text-ink">
              {conveners.map((org, index) => (
                <span key={org.href}>
                  {index > 0 ? ", " : null}
                  <Link className="text-link" href={org.href}>{org.name}</Link>
                </span>
              ))}
            </p>
          ) : (
            <p className="text-sm font-medium break-words text-ink">{acceptor || "—"}</p>
          )}
        </li>
      </ul>
      {!admitted_at ? (
        <form action={`/api/admin/empresas/${id}/aceptar`} method="post" className="space-y-2">
          <p className="text-small text-ink-secondary">
            Aceptar la empresa habilita diagnósticos y metodología. No confirma el correo ni el lugar RSVP.
          </p>
          <ActionButton hold pendingLabel="Aceptando…">Aceptar empresa</ActionButton>
        </form>
      ) : (
        <p className="text-small text-ink-secondary">Empresa aceptada: ya puede resolver diagnósticos.</p>
      )}
    </div>
  );
}
