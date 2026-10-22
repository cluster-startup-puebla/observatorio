import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { SectionForms } from "@/app/admin/metodologia/[id]/forms";
import { SectionLists } from "@/app/admin/metodologia/[id]/lists";
import { loadSeccion } from "@/lib/admin/metodologia/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [
  { value: "bandas", label: "Bandas" },
  { value: "preguntas", label: "Preguntas" },
  { value: "opciones", label: "Opciones" },
  { value: "condiciones", label: "Condiciones" },
  { value: "nivel", label: "Nivel" },
];

export default async function SeccionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadSeccion(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, tabs.map((tab) => tab.value), "bandas");
  return (
    <DetailFrame
      title={data.section.name}
      backHref="/admin/metodologia"
      facts={[
        { label: "Orden", value: String(data.section.position) },
        { label: "Rango", value: data.section.range_kind },
        { label: "Nivel calculado", value: `${data.level.category} (${data.level.totalScore})` },
      ]}
      tabs={tabs}
      active={active}
    >
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      <SectionForms id={id} section={data.section} questions={data.questions} options={data.options} bands={data.bands} />
      <SectionLists active={active} data={data} />
    </DetailFrame>
  );
}
