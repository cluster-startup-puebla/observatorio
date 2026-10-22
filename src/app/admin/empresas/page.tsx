import { DataList } from "@/components/admin/data-list";
import { listEmpresas } from "@/lib/admin/empresas/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function EmpresasPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listEmpresas(params.page);
  return (
    <DataList
      title="Empresas"
      lead="La empresa del empresario y su perfil."
      columns={[
        { key: "legal_name", label: "Razón social" },
        { key: "employee_band", label: "Tamaño" },
        { key: "sector_id", label: "Sector" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/empresas"
    />
  );
}
