import { UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { attendanceAction } from "@/lib/admin/crm/attendance";
import type { ContactPass } from "@/lib/admin/crm/pass";
import type { CrmStatus } from "@/lib/crm-status";

function when(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function ContactoAcceso({
  id,
  pass,
  statusCode,
}: {
  id: string;
  pass: ContactPass | null;
  statusCode: string | null;
}) {
  const action = attendanceAction({
    hasPass: Boolean(pass),
    arrivedAt: pass?.arrivedAt ?? "",
    status: (statusCode as CrmStatus | null) ?? null,
  });
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-line bg-elevated p-6 sm:flex-row sm:items-center">
      {pass ? (
        <img
          src={`/api/admin/medios/${pass.assetId}/archivo`}
          alt="QR de acceso"
          className="size-48 rounded-xl border border-line bg-surface-subtle object-contain"
        />
      ) : (
        <p className="text-small text-ink-secondary">Todavía no tiene QR de acceso.</p>
      )}
      <div className="grid gap-3">
        <h3 className="text-body font-semibold text-ink">Pase de acceso</h3>
        {action.kind === "done" && pass?.arrivedAt ? (
          <p className="text-small text-ink-secondary">Asistió {when(pass.arrivedAt)}.</p>
        ) : null}
        {action.kind === "blocked" ? (
          <p className="text-small text-ink-secondary">La asistencia se marca cuando ya está registrada.</p>
        ) : null}
        {action.kind === "ready" ? (
          <form action={`/api/admin/crm/${id}/asistencia`} method="post" className="grid gap-2">
            <Button type="submit" size="lg" className="w-fit px-4">
              <UserCheck />
              Marcar que asistió
            </Button>
            <p className="text-small text-ink-secondary">Úsalo si la mesa no pudo escanear el QR.</p>
          </form>
        ) : null}
      </div>
    </section>
  );
}
