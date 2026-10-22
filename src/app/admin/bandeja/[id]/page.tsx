import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { kindLabel } from "@/lib/admin/bandeja/kind-label";
import { loadMensaje } from "@/lib/admin/bandeja/detail";
import { tabQuery } from "@/lib/admin/tab-query";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [{ value: "mensaje", label: "Mensaje" }];

export default async function MensajeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadMensaje(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, ["mensaje"], "mensaje");
  return (
    <DetailFrame
      title={data.subject}
      backHref="/admin/bandeja"
      facts={[
        { label: "Tipo", value: kindLabel(data.kind) },
        { label: "Para", value: data.to_email },
        { label: "Asunto", value: data.subject },
      ]}
      tabs={tabs}
      active={active}
    >
      <p className="text-small text-ink-muted">Reintenta el envío desde la lista de la bandeja.</p>
    </DetailFrame>
  );
}
