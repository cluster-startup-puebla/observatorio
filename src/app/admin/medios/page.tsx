import { DataList } from "@/components/admin/data-list";
import { listMedios } from "@/lib/admin/medios/list";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function MediosPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireSuperadmin();
  const params = await searchParams;
  const data = await listMedios(params.page);
  return (
    <DataList
      title="Medios"
      lead="Logos, imágenes de contenido y pases. Los bytes están en Storage."
      columns={[
        { key: "purpose", label: "Uso" },
        { key: "bucket_id", label: "Bucket" },
        { key: "object_path", label: "Ruta" },
        { key: "byte_size", label: "Bytes" },
      ]}
      rows={data.rows}
      page={data.page}
      basePath="/admin/medios"
    />
  );
}
