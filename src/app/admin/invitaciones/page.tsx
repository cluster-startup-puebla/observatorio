import { UploadForm } from "@/app/admin/invitaciones/upload-form";
import { DataList } from "@/components/admin/data-list";
import { listInvitaciones } from "@/lib/admin/invitaciones/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function InvitacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listInvitaciones(params.page);
  return (
    <DataList
      title="Invitaciones"
      lead="Carga de Excel y alta a mano."
      columns={[
        { key: "nombre", label: "Nombre" },
        { key: "empresa", label: "Empresa" },
        { key: "email", label: "Correo" },
        { key: "source", label: "Origen" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/invitaciones"
      error={params.error}
    >
      <UploadForm orgs={data.orgs} open={Boolean(params.error)} />
    </DataList>
  );
}
