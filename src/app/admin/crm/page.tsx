import { DataList } from "@/components/admin/data-list";
import { listCrm } from "@/lib/admin/crm/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function CrmPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listCrm(params.page);
  return (
    <DataList
      title="CRM"
      lead="Contactos de todos los organismos. El estatus sale de los hechos."
      columns={[
        { key: "nombre", label: "Nombre" },
        { key: "empresa", label: "Empresa" },
        { key: "email", label: "Correo" },
        { key: "source", label: "Origen" },
        { key: "status", label: "Estatus" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/crm"
    />
  );
}
