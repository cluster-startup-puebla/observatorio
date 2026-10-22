import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { FormSheet } from "@/components/admin/form-sheet";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadSesion } from "@/lib/admin/sesiones/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { FichaForm } from "@/app/admin/sesiones/[id]/ficha-form";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export const instant = false;

const tabs = [
  { value: "ficha", label: "Ficha" },
  { value: "temas", label: "Temas" },
  { value: "asistentes", label: "Asistentes" },
];

export default async function SesionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadSesion(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, tabs.map((tab) => tab.value), "ficha");
  const session = data.session;
  return (
    <DetailFrame
      title={session.venue}
      backHref="/admin/sesiones"
      facts={[
        { label: "Formato", value: session.format_name },
        { label: "Horario", value: `${session.starts_local}–${session.ends_local}` },
        { label: "Cupo", value: `${session.capacity_min}–${session.capacity_max}` },
        { label: "Vigente", value: session.is_current ? "Sí" : "No" },
      ]}
      tabs={tabs}
      active={active}
    >
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      {active === "ficha" ? <FichaForm id={id} session={session} open={active === "ficha" && Boolean(query.error)} /> : null}
      {active === "temas" ? (
        <div>
          <ul>
            {data.topics.map((topic) => (
              <li key={topic.id}>
                {topic.position}. {topic.title}
              </li>
            ))}
          </ul>
          <FormSheet action="Crear" resource="tema" open={Boolean(query.error)}>
            <form action={`/api/admin/sesiones/${id}/temas`} method="post" className="grid gap-3">
              <input name="position" type="number" min={1} />
              <input name="title" />
              <SheetSubmit>Agregar tema</SheetSubmit>
            </form>
          </FormSheet>
        </div>
      ) : null}
      {active === "asistentes" ? (
        <ul>
          {data.attendees.map((row) => (
            <li key={row.profile_id}>{row.profile_id}</li>
          ))}
        </ul>
      ) : null}
    </DetailFrame>
  );
}
