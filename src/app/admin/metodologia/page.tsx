import { DataList } from "@/components/admin/data-list";
import { listMetodologia } from "@/lib/admin/metodologia/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function MetodologiaPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listMetodologia(params.page);
  return (
    <DataList
      title="Metodología"
      lead="Secciones, bandas, preguntas, opciones y condiciones."
      columns={[
        { key: "name", label: "Sección" },
        { key: "position", label: "Orden" },
        { key: "range_kind", label: "Rango" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/metodologia"
    >
      <a className="text-link" href="/admin/metodologia/integral">
        Bandas integrales
      </a>
    </DataList>
  );
}
