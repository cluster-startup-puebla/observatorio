import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadEmpresa } from "@/lib/admin/empresas/detail";
import { companyTabs } from "@/lib/admin/empresas/tabs";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function EmpresaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadEmpresa(id);
  if (!data) notFound();
  const active = tabQuery(query.tab, companyTabs.map((tab) => tab.value), "sector");
  return (
    <DetailFrame
      title={data.company.legal_name}
      backHref="/admin/empresas"
      facts={[
        { label: "Sector", value: data.sector?.name ?? "" },
        { label: "Tamaño", value: data.company.employee_label },
        { label: "Cómo llegó el sector", value: data.company.source_label },
        { label: "Referencia", value: data.company.referral_source },
        { label: "Logo el día del evento", value: data.company.show_logo_on_event ? "Sí" : "No" },
      ]}
      tabs={[...companyTabs]}
      active={active}
    >
      {query.error ? <p className="text-small text-mark">{query.error}</p> : null}
      {data.company.show_logo_on_event ? (
        <img src={`/api/admin/empresas/${id}/logo`} alt="" className="mt-4 h-16 w-auto object-contain" />
      ) : null}
      {active === "respuestas" ? (
        <ul className="mt-4">
          {data.answers.map((row) => (
            <li key={`${row.question_id}-${row.option_value}`}>
              {row.question_id}: {row.option_value}
            </li>
          ))}
        </ul>
      ) : null}
      {active === "pase" ? <p className="mt-4">{data.pass ? "Pase emitido." : "Sin pase."}</p> : null}
    </DetailFrame>
  );
}
