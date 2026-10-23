import { notFound } from "next/navigation";
import { CuposTab } from "@/app/admin/sesiones/[id]/cupos-tab";
import { FichaTab } from "@/app/admin/sesiones/[id]/ficha-tab";
import { TemasTab } from "@/app/admin/sesiones/[id]/temas-tab";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadSesion } from "@/lib/admin/sesiones/detail";
import { sessionWhen } from "@/lib/sessions/face";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [
  { value: "ficha", label: "Ficha" },
  { value: "sectores", label: "Sectores" },
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
  const quotaLabel = data.quotas.length
    ? `${session.capacity_max} en ${data.quotas.length} sectores`
    : `${session.capacity_min}–${session.capacity_max}`;
  return (
    <DetailFrame
      title={session.venue}
      backHref="/admin/sesiones"
      facts={[
        { label: "Formato", value: session.format_name },
        {
          label: "Horario",
          value: sessionWhen({
            sessionOn: session.session_on,
            starts: session.starts_local,
            ends: session.ends_local,
            timeZone: session.time_zone,
          }),
        },
        { label: "Cupo", value: quotaLabel },
        { label: "Vigente", value: session.is_current ? "Sí" : "No" },
      ]}
      tabs={tabs}
      active={active}
    >
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      {active === "ficha" ? <FichaTab audience={session.audience} includes={session.includes} /> : null}
      {active === "sectores" ? <CuposTab quotas={data.quotas} /> : null}
      {active === "temas" ? <TemasTab id={id} topics={data.topics} open={Boolean(query.error)} /> : null}
      {active === "asistentes" ? (
        <ul className="grid gap-1 text-small">
          {data.attendees.map((row) => (
            <li key={row.profile_id}>{row.profile_id}</li>
          ))}
        </ul>
      ) : null}
    </DetailFrame>
  );
}
