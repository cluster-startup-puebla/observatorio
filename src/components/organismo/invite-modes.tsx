import Link from "next/link";
import { EmailBox } from "@/components/organismo/email-box";
import { InviteUpload } from "@/components/organismo/invite-upload";
import { ManualInvite } from "@/components/organismo/manual-invite";
import { orgHref } from "@/lib/sessions/org-href";

const modes = [
  {
    id: "mano",
    label: "Una persona",
    lead: "Nombre, empresa y correo. Queda pendiente en el CRM.",
  },
  {
    id: "archivo",
    label: "Desde un archivo",
    lead: "Un CSV con nombre, empresa y correo. Descarga la plantilla y súbela.",
  },
  {
    id: "correos",
    label: "Varios correos",
    lead: "Un correo por línea. Cada uno entra al CRM como pendiente.",
  },
] as const;

type Mode = (typeof modes)[number]["id"];

function activeMode(mode: string, error?: string): Mode {
  if (error === "correos") return "correos";
  return modes.some((item) => item.id === mode) ? (mode as Mode) : "mano";
}

export function InviteModes({
  slug,
  sessionSlug,
  mode,
  error,
}: {
  slug: string;
  sessionSlug?: string;
  mode: string;
  error?: string;
}) {
  const active = activeMode(mode, error);
  const current = modes.find((item) => item.id === active) ?? modes[0];
  const invites = `${orgHref(slug, sessionSlug)}/invitaciones`;

  return (
    <div className="grid gap-6">
      <nav className="flex flex-wrap rounded-full border border-line bg-surface-subtle p-1" aria-label="Forma de invitar">
        {modes.map((item) => {
          const on = item.id === active;
          return (
            <Link
              key={item.id}
              href={`${invites}?modo=${item.id}`}
              aria-current={on ? "page" : undefined}
              className={
                on
                  ? "rounded-full bg-brand px-4 py-1.5 text-small font-semibold text-on-brand"
                  : "rounded-full px-4 py-1.5 text-small font-semibold text-ink"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="text-body text-ink-secondary">{current.lead}</p>
      {active === "mano" ? <ManualInvite slug={slug} error={error} /> : null}
      {active === "archivo" ? (
        <div className="grid gap-5">
          <a className="text-small font-semibold text-link" href={`${invites}/plantilla`}>
            Descargar plantilla
          </a>
          <InviteUpload slug={slug} error={error} />
        </div>
      ) : null}
      {active === "correos" ? <EmailBox slug={slug} error={error} /> : null}
    </div>
  );
}
