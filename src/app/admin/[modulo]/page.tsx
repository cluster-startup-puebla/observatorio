import { notFound } from "next/navigation";
import { adminModules } from "@/components/admin/modules";
import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function AdminModulePage({
  params,
}: {
  params: Promise<{ modulo: string }>;
}) {
  await requireSuperadmin();
  const { modulo } = await params;
  const moduleInfo = adminModules[modulo];
  if (!moduleInfo) notFound();

  return (
    <main className="px-8 py-8">
      <PanelHeader
        title={moduleInfo.title}
        lead={moduleInfo.lead}
        crumbs={listCrumbs(moduleInfo.title, `/admin/${modulo}`)}
      />
      <ul className="mt-8 grid max-w-xl gap-3">
        {moduleInfo.actions.map((action) => (
          <li key={action} className="rounded-xl border border-line bg-elevated px-4 py-3 text-body text-ink">
            {action}
          </li>
        ))}
      </ul>
    </main>
  );
}
