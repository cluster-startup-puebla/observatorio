import { notFound } from "next/navigation";
import { DetailFrame } from "@/components/admin/detail-frame";
import { RoleForm } from "@/app/admin/cuentas/[id]/role-form";
import { CuentaTabs } from "@/app/admin/cuentas/[id]/tabs";
import { tabQuery } from "@/lib/admin/tab-query";
import { loadCuenta } from "@/lib/admin/cuentas/detail";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

const tabs = [
  { value: "empresa", label: "Empresa" },
  { value: "pase", label: "Pase" },
  { value: "respuestas", label: "Respuestas" },
  { value: "correos", label: "Correos" },
];

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
  const active = tabQuery(query.tab, tabs.map((tab) => tab.value), "empresa");
  const profile = data.profile;
  return (
    <DetailFrame
      title={profile.full_name || profile.email || id}
      backHref="/admin/cuentas"
      facts={[
        { label: "Correo", value: profile.email ?? "" },
        { label: "Rol", value: profile.role },
        { label: "Puesto", value: profile.job_title ?? "" },
        { label: "WhatsApp", value: profile.whatsapp ?? "" },
      ]}
      tabs={tabs}
      active={active}
    >
      {query.error ? <p className="mb-4 text-small text-mark">{query.error}</p> : null}
      <RoleForm id={id} role={profile.role} organizationId={profile.organization_id ?? ""} orgs={data.orgs} />
      <CuentaTabs
        active={active}
        companyName={data.company?.legal_name ?? ""}
        hasPass={Boolean(data.pass)}
        answers={data.answers}
        mail={data.mail}
      />
    </DetailFrame>
  );
}
