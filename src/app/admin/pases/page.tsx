import { DataList } from "@/components/admin/data-list";
import { listPases } from "@/lib/admin/pases/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function PasesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listPases(params.page);
  return (
    <DataList
      title="Pases y llegadas"
      lead="El QR del perfil y el escaneo de la mesa."
      columns={[
        { key: "profile_id", label: "Perfil" },
        { key: "issued_at", label: "Emitido" },
        { key: "llegada", label: "Llegada" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/pases"
    />
  );
}
