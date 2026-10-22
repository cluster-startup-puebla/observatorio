import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { FormSheet } from "@/components/admin/form-sheet";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadMedio } from "@/lib/admin/medios/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [{ value: "archivo", label: "Archivo" }];

export default async function MedioDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadMedio(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, ["archivo"], "archivo");
  return (
    <DetailFrame
      title={data.purpose}
      backHref="/admin/medios"
      facts={[
        { label: "Bucket", value: data.bucket_id },
        { label: "Ruta", value: data.object_path },
        { label: "Tipo", value: data.content_type },
        { label: "Bytes", value: String(data.byte_size) },
      ]}
      tabs={tabs}
      active={active}
    >
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      <FormSheet action="Editar" resource="archivo" open={Boolean(query.error)}>
        <form action={`/api/admin/medios/${id}`} method="post" encType="multipart/form-data" className="grid gap-3">
          <input name="filename" placeholder="foto.png" />
          <input name="archivo" type="file" accept="image/png,image/jpeg,image/webp" />
          <button className="btn btn-primary" type="submit">
            Reemplazar
          </button>
        </form>
      </FormSheet>
    </DetailFrame>
  );
}
