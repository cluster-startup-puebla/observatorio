import { notFound } from "next/navigation";
import { CorreosSection } from "@/app/admin/cuentas/[id]/correos-section";
import { CuentaFicha } from "@/app/admin/cuentas/[id]/cuenta-ficha";
import { CuentaHeader } from "@/app/admin/cuentas/[id]/cuenta-header";
import { CuentaNav } from "@/app/admin/cuentas/[id]/cuenta-nav";
import { PaseSection } from "@/app/admin/empresas/[id]/pase-section";
import { RespuestasSection } from "@/app/admin/empresas/[id]/respuestas-section";
import { PanelHeader, parentLabel, trailCrumbs } from "@/components/admin/panel-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { accountKind, cuentaTabList, roleLabel } from "@/lib/admin/cuentas/account-kind";
import { loadCuenta } from "@/lib/admin/cuentas/detail";
import { bandLabel } from "@/lib/admin/empresas/band-label";
import { loadAnswerLines } from "@/lib/admin/empresas/answer-lines";
import { tabQuery } from "@/lib/admin/tab-query";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function CuentaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  await requireSuperadmin();
  const { id } = await params;
  const query = await searchParams;
  const data = await loadCuenta(id);
  if (!data) notFound();
  const profile = data.profile;
  const kind = accountKind(profile.role);
  const tabs = cuentaTabList(kind);
  const active = tabQuery(query.tab, tabs.map((tab) => tab.value), "ficha");
  const name = profile.full_name || profile.email || id;
  const org = data.orgs.find((item) => item.id === profile.organization_id);
  const companyHref = data.company ? `/admin/empresas/${data.company.id}` : "";
  const orgHref = org ? `/admin/organismos/${org.id}` : "";
  const place = kind === "empresario" ? data.company?.legal_name ?? "" : kind === "organismo" ? org?.name ?? "" : "";
  const placeHref = kind === "empresario" ? companyHref : orgHref;
  const lines = kind === "empresario" ? await loadAnswerLines(data.answers) : [];
  return (
    <main className="px-8 py-8">
      <PanelHeader title={name} crumbs={trailCrumbs(parentLabel("/admin/cuentas"), "/admin/cuentas", name)} />
      <CuentaHeader
        name={name}
        role={roleLabel(profile.role)}
        jobTitle={profile.job_title ?? ""}
        kind={kind}
        place={place}
        placeHref={placeHref}
        hasPass={Boolean(data.pass?.image_asset_id)}
      />
      {query.error ? (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{query.error}</AlertDescription>
        </Alert>
      ) : null}
      <CuentaNav id={id} active={active} tabs={tabs} answers={lines.length} mail={data.mail.length} />
      <div className="mt-6">
        {active === "pase" ? <PaseSection assetId={data.pass?.image_asset_id ?? null} /> : null}
        {active === "respuestas" ? <RespuestasSection lines={lines} /> : null}
        {active === "correos" ? <CorreosSection mail={data.mail} /> : null}
        {active === "ficha" ? (
          <CuentaFicha
            kind={kind}
            email={profile.email ?? ""}
            whatsapp={profile.whatsapp ?? ""}
            jobTitle={profile.job_title ?? ""}
            place={place}
            placeHref={placeHref}
            employees={bandLabel(data.company?.employee_band ?? "")}
            role={roleLabel(profile.role)}
          />
        ) : null}
      </div>
    </main>
  );
}
