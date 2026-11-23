import { notFound } from "next/navigation";
import { AsistentesTab } from "@/app/admin/sesiones/[id]/asistentes-tab";
import { CuposTab } from "@/app/admin/sesiones/[id]/cupos-tab";
import { FichaTab } from "@/app/admin/sesiones/[id]/ficha-tab";
import { LogosTab } from "@/app/admin/sesiones/[id]/logos-tab";
import { TemasTab } from "@/app/admin/sesiones/[id]/temas-tab";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadSesion } from "@/lib/admin/sesiones/detail";
import { kindLabel, modalityLabel } from "@/lib/admin/sesiones/kinds";
import { sessionWhen } from "@/lib/sessions/face";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [
  { value: "ficha", label: "Ficha" },
  { value: "sectores", label: "Sectores" },
  { value: "temas", label: "Temas" },
  { value: "asistentes", label: "Asistentes" },
  { value: "logos", label: "Logos" },
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
      title={session.title || session.venue}
      backHref="/admin/sesiones"
      facts={[
        { label: "Lugar", value: session.venue },
        { label: "Tipo", value: modalityLabel(String(session.modality ?? "presencial")) },
        { label: "Plantilla", value: kindLabel(String(session.kind ?? "foro")) },
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
        { label: "Enlace", value: session.public_slug ? `/sesiones/${session.public_slug}` : "—" },
      ]}
      tabs={tabs.map((tab) =>
        tab.value === "asistentes" ? { ...tab, count: data.attendees.length } : tab,
      )}
      active={active}
    >
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      {active === "ficha" ? (
        <FichaTab
          audience={session.audience}
          includes={session.includes}
          formatName={session.format_name}
          modality={modalityLabel(String(session.modality ?? "presencial"))}
          kind={kindLabel(String(session.kind ?? "foro"))}
          instrumentId={session.instrument_id ?? null}
        />
      ) : null}
      {active === "sectores" ? <CuposTab quotas={data.quotas} /> : null}
      {active === "temas" ? <TemasTab id={id} topics={data.topics} open={Boolean(query.error)} /> : null}
      {active === "logos" ? <LogosTab sessionId={id} /> : null}
      {active === "asistentes" ? <AsistentesTab rows={data.attendees} /> : null}
    </DetailFrame>
  );
}
