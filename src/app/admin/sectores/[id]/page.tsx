import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { FormSheet } from "@/components/admin/form-sheet";
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
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      {active === "ficha" ? <p>/{data.sector.slug}</p> : null}
      {active === "pagina" ? (
        <FormSheet action="Editar" resource="página" open={Boolean(query.error)}>
          <form action={`/api/admin/sectores/${id}`} method="post" className="grid gap-3">
            <label className="grid gap-1 text-small" htmlFor="headline">
              Titular
              <input id="headline" name="headline" defaultValue={data.page?.headline ?? ""} />
            </label>
            <label className="grid gap-1 text-small" htmlFor="body">
              Cuerpo
              <textarea id="body" name="body" defaultValue={data.page?.body ?? ""} />
            </label>
            <button className="btn btn-primary" type="submit">
              Guardar página
            </button>
          </form>
        </FormSheet>
      ) : null}
    </DetailFrame>
  );
}
