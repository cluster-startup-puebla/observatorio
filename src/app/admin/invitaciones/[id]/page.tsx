import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadInvitacion } from "@/lib/admin/invitaciones/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [{ value: "ficha", label: "Ficha" }];

export default async function InvitacionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; tab?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadInvitacion(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, ["ficha"], "ficha");
  return (
    <DetailFrame
      title={data.contact.nombre}
      backHref="/admin/invitaciones"
      facts={[
        { label: "Empresa", value: data.contact.empresa },
        { label: "Correo", value: data.contact.email },
        { label: "Origen", value: data.contact.source },
        { label: "Estatus", value: data.status },
      ]}
      tabs={tabs}
      active={active}
    >
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      <form action={`/api/admin/invitaciones/${id}`} method="post" className="mt-4">
        <button className="btn btn-primary" type="submit">
          Confirmar
        </button>
      </form>
    </DetailFrame>
  );
}
