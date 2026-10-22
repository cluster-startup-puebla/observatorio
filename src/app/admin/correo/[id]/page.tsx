import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { adminDb } from "@/lib/admin/admin-db";
import { innovationDetail } from "@/lib/admin/correo/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function CorreoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSuperadmin();
  const { id } = await params;
  const db = await adminDb();
  if (!db) notFound();
  const row = await db.from("outbox_messages").select("kind, subject, to_email, created_at").eq("id", id).maybeSingle();
  const detail = innovationDetail(row.data);
  if (!detail) notFound();
  return (
    <DetailFrame
      title={detail.subject}
      backHref="/admin/correo"
      facts={[
        { label: "Para", value: detail.to },
        { label: "Asunto", value: detail.subject },
        { label: "Encolado", value: row.data?.created_at ?? "" },
      ]}
      tabs={[{ value: "mensaje", label: "Mensaje" }]}
      active="mensaje"
    >
      <p>Este aviso solo se encola para quien ya terminó el perfil.</p>
    </DetailFrame>
  );
}
