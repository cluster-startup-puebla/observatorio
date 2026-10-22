import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadPase } from "@/lib/admin/pases/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [
  { value: "qr", label: "QR" },
  { value: "llegada", label: "Llegada" },
];

export default async function PaseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadPase(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, tabs.map((tab) => tab.value), "qr");
  return (
    <DetailFrame
      title={data.profile?.full_name || data.profile?.email || id}
      backHref="/admin/pases"
      facts={[
        { label: "Ruta", value: data.path },
        { label: "Emitido", value: data.pass.issued_at },
        { label: "Llegada", value: data.arrival?.scanned_at ?? "" },
      ]}
      tabs={tabs}
      active={active}
    >
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      {active === "qr" ? <p data-testid="ruta-pase">{data.path}</p> : null}
      {active === "llegada" ? (
        <form action={`/api/admin/pases/${id}/llegada`} method="post">
          <button className="btn btn-primary" type="submit" disabled={Boolean(data.arrival)}>
            Marcar que llegó
          </button>
        </form>
      ) : null}
    </DetailFrame>
  );
}
