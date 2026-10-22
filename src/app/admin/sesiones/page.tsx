import { CreateSessionForm } from "@/app/admin/sesiones/create-form";
import { DataList } from "@/components/admin/data-list";
import { listSesiones } from "@/lib/admin/sesiones/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function SesionesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listSesiones(params.page);
  return (
    <DataList
      title="Sesiones"
      lead="La sesión del sector y sus temas."
      columns={[
        { key: "venue", label: "Lugar" },
        { key: "format_name", label: "Formato" },
        { key: "starts_local", label: "Empieza" },
        { key: "ends_local", label: "Termina" },
        { key: "is_current", label: "Vigente" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/sesiones"
      error={params.error}
    >
      <CreateSessionForm />
    </DataList>
  );
}
