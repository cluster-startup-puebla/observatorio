import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { SectorBodyPreview } from "@/components/landing/sections/sector-page-message";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadSector } from "@/lib/admin/sectores/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [
  { value: "ficha", label: "Ficha" },
  { value: "pagina", label: "Página" },
];

export default async function SectorDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadSector(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, tabs.map((tab) => tab.value), "ficha");
  return (
    <DetailFrame
      title={data.sector.name}
      backHref="/admin/sectores"
      facts={[
        { label: "Ruta", value: data.sector.slug },
        { label: "Orden", value: String(data.sector.position) },
        { label: "Titular", value: data.page?.headline ?? "" },
      ]}
      tabs={tabs}
      active={active}
    >
      {active === "ficha" ? <p className="text-small text-ink-muted">/{data.sector.slug}</p> : null}
      {active === "pagina" ? (
        <div className="grid gap-2 text-small">
          <p>
            <span className="text-ink-muted">Titular · </span>
            {data.page?.headline || "Sin titular"}
          </p>
          <SectorBodyPreview body={data.page?.body ?? ""} />
        </div>
      ) : null}
    </DetailFrame>
  );
}
