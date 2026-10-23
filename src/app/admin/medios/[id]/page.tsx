import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { FallbackImage } from "@/components/admin/fallback-image";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadMedio } from "@/lib/admin/medios/detail";
import { mediaPreviewPath } from "@/lib/admin/medios/public-access";
import { purposeLabel } from "@/lib/admin/medios/purpose-label";
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
      title={purposeLabel(data.purpose)}
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
      <div className="mb-6">
        <FallbackImage
          src={mediaPreviewPath(data.purpose, data.id)}
          alt={purposeLabel(data.purpose)}
          className="max-h-80 max-w-full rounded-xl border border-line bg-elevated object-contain"
        />
      </div>
      <p className="text-small text-ink-muted">Reemplaza el archivo desde la lista de medios.</p>
    </DetailFrame>
  );
}
