import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadEmpresa } from "@/lib/admin/empresas/detail";
import { seatFullCopy } from "@/lib/cupo/seat-full-copy";
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
        { label: "Aprobación", value: data.company.approval_label },
        { label: "Aceptó", value: data.company.admitted_by_email || "Nadie" },
        { label: "Referencia", value: data.company.referral_source },
        { label: "Logo el día del evento", value: data.company.show_logo_on_event ? "Sí" : "No" },
      ]}
      tabs={[...companyTabs]}
      active={active}
    >
      {seatFullCopy(query.error) || query.error ? (
        <p className="text-small text-mark">{seatFullCopy(query.error) || query.error}</p>
      ) : null}
      {data.company.sector_source === "path" && !data.company.admitted_at ? (
        <form action={`/api/admin/empresas/${id}/aceptar`} method="post" className="mt-4">
          <button className="btn btn-primary" type="submit">Aceptar</button>
        </form>
      ) : null}
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
