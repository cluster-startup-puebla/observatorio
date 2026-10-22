import { DataList } from "@/components/admin/data-list";
import { listSectores } from "@/lib/admin/sectores/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function SectoresPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listSectores(params.page);
  return (
    <DataList
      title="Sectores"
      lead="El catálogo y el mensaje de la landing, solo si ya está escrito."
      columns={[
        { key: "name", label: "Nombre" },
        { key: "slug", label: "Ruta" },
        { key: "position", label: "Orden" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/sectores"
    />
  );
}
