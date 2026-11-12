import { notFound } from "next/navigation";
import { ApprovalPills } from "@/app/admin/empresas/[id]/approval-pills";
import { EmpresaHeaderCard } from "@/app/admin/empresas/[id]/header-card";
import { EmpresaTabs } from "@/app/admin/empresas/[id]/empresa-tabs";
import { PanelHeader, parentLabel, trailCrumbs } from "@/components/admin/panel-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loadAnswerLines } from "@/lib/admin/empresas/answer-lines";
import { loadEmpresa } from "@/lib/admin/empresas/detail";
import { companyTabs } from "@/lib/admin/empresas/tabs";
import { tabQuery } from "@/lib/admin/tab-query";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";
import { seatFullCopy } from "@/lib/cupo/seat-full-copy";

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
  const lines = await loadAnswerLines(data.answers ?? []);
  const notice = seatFullCopy(query.error) || query.error;
  const company = data.company;
  return (
    <main className="px-8 py-8">
      <PanelHeader
        title={company.legal_name}
        crumbs={trailCrumbs(parentLabel("/admin/empresas"), "/admin/empresas", company.legal_name)}
      />
      <EmpresaHeaderCard
        id={id}
        legalName={company.legal_name}
        sourceLabel={company.source_label}
        sectorId={company.sector_id ?? ""}
        sectorName={data.sector?.name ?? ""}
        employeeLabel={company.employee_label}
        referral={company.referral_source ?? ""}
        showLogo={Boolean(company.show_logo_on_event)}
      />
      <ApprovalPills label={company.approval_label} conveners={company.conveners} />
      {notice ? (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}
      <EmpresaTabs
        active={active}
        id={id}
        sourceLabel={company.source_label}
        acceptor={company.acceptor}
        conveners={company.conveners}
        sectorSource={company.sector_source}
        admittedAt={company.admitted_at}
        hasLink={company.has_link}
        employeeLabel={company.employee_label}
        member={company.member}
        lines={lines}
        assetId={data.pass?.image_asset_id ?? null}
      />
    </main>
  );
}
