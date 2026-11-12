import { BadgeCheck, CalendarCheck, Phone, UserPlus, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyCrmEvent, type CrmEvent, type CrmStatus } from "@/lib/crm-status";
import { crmEventLabel } from "@/lib/crm-label";

const actions: [CrmEvent, string, "default" | "outline" | "destructive", LucideIcon][] = [
  ["contactar", "Contactar", "outline", Phone],
  ["confirmar", "Confirmar que viene", "default", CalendarCheck],
  ["registrar", "Registrar", "default", UserPlus],
  ["rechazar", "Rechazar", "destructive", X],
];

function when(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function HechosPanel({
  id,
  source,
  statusCode,
  events,
}: {
  id: string;
  source: string;
  statusCode: string | null;
  events: { id: string; event: string; occurred_at: string }[];
}) {
  const status = (statusCode as CrmStatus | null) ?? null;
  const open = actions.filter(([event]) => applyCrmEvent(status, event as CrmEvent).ok);
  return (
    <div className="grid gap-4">
      <p className="max-w-2xl text-small text-ink-secondary">
        El seguimiento es el recorrido de esta persona: se cargó, se le contactó, confirmó que viene, se registró o se rechazó. Solo aparecen los pasos que siguen. La asistencia del evento se marca en el pase, en la ficha.
      </p>
      {events.length ? (
        <ul className="grid gap-2">
          {events.map((row) => (
            <li key={row.id} className="flex items-baseline justify-between gap-4 rounded-xl border border-line bg-elevated px-4 py-3">
              <span className="text-body text-ink">{crmEventLabel(row.event)}</span>
              <span className="text-small text-ink-secondary">{when(row.occurred_at)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-small text-ink-secondary">Todavía no hay pasos.</p>
      )}
      {source === "enlace" && statusCode === "cargado" ? (
        <form action={`/api/admin/crm/${id}/evento`} method="post">
          <input type="hidden" name="event" value="aprobar" />
          <Button type="submit" size="lg" className="w-fit px-4">
            <BadgeCheck />
            Aceptar registro
          </Button>
        </form>
      ) : null}
      {open.length ? (
        <div className="flex flex-wrap gap-2">
          {open.map(([event, label, variant, Icon]) => (
            <form key={event} action={`/api/admin/crm/${id}/evento`} method="post">
              <input type="hidden" name="event" value={event} />
              <Button type="submit" variant={variant} size="lg" className="px-4">
                <Icon />
                {label}
              </Button>
            </form>
          ))}
        </div>
      ) : (
        <p className="text-small text-ink-secondary">No hay un paso siguiente.</p>
      )}
    </div>
  );
}
