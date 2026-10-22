import { DataList } from "@/components/admin/data-list";
import { listOrganismos } from "@/lib/admin/organismos/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function OrganismosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listOrganismos(params.page);
  return (
    <DataList
      title="Organismos"
      lead="Quien convoca: marca, miembros y enlaces."
      columns={[
        { key: "name", label: "Nombre" },
        { key: "brand_color", label: "Color" },
        { key: "brand_completed_at", label: "Marca" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/organismos"
    />
  );
}
