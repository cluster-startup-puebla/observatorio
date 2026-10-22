import { DataList } from "@/components/admin/data-list";
import { StaffForm } from "@/app/admin/cuentas/staff-form";
import { listCuentas } from "@/lib/admin/cuentas/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function CuentasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listCuentas(params.page);
  return (
    <DataList
      title="Cuentas"
      lead="Perfiles de los seis roles. El alta pública no elige staff."
      columns={[
        { key: "full_name", label: "Nombre" },
        { key: "email", label: "Correo" },
        { key: "role", label: "Rol" },
        { key: "onboarded_at", label: "Perfil" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/cuentas"
      error={params.error}
    >
      <StaffForm orgs={data.orgs} error={params.error ?? ""} />
    </DataList>
  );
}
