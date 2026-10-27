import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadCrm } from "@/lib/admin/crm/detail";
import { seatFullCopy } from "@/lib/cupo/seat-full-copy";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [
  { value: "ficha", label: "Ficha" },
  { value: "hechos", label: "Hechos" },
];
const actions = ["contactar", "rechazar", "confirmar", "registrar", "llegar"];

export default async function CrmDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadCrm(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, tabs.map((tab) => tab.value), "ficha");
  return (
    <DetailFrame
      title={data.contact.nombre}
      backHref="/admin/crm"
      facts={[
        { label: "Empresa", value: data.contact.empresa },
        { label: "Correo", value: data.contact.email },
        { label: "Origen", value: data.contact.source },
        { label: "Estatus", value: data.status },
      ]}
      tabs={tabs}
      active={active}
    >
      {seatFullCopy(query.error) || query.error ? (
        <p className="text-small text-mark">{seatFullCopy(query.error) || query.error}</p>
      ) : null}
      {active === "hechos" ? (
        <div className="grid gap-4">
          <ul>
            {data.events.map((row) => (
              <li key={row.id}>{row.event}</li>
            ))}
          </ul>
          {data.contact.source === "enlace" && data.statusCode === "cargado" ? (
            <form action={`/api/admin/crm/${id}/evento`} method="post">
              <input type="hidden" name="event" value="aprobar" />
              <button className="btn btn-primary" type="submit">Aceptar</button>
            </form>
          ) : null}
          {actions.map((event) => (
            <form key={event} action={`/api/admin/crm/${id}/evento`} method="post">
              <input type="hidden" name="event" value={event} />
              <button className="btn" type="submit">
                {event}
              </button>
            </form>
          ))}
        </div>
      ) : null}
    </DetailFrame>
  );
}
