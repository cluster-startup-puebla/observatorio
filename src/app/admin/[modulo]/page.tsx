import { notFound } from "next/navigation";
import { SectorCompanies } from "@/app/admin/[modulo]/sector-companies";
import { adminModules } from "@/components/admin/modules";
import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import { listSectorCompanies } from "@/lib/admin/sectores/companies";
import { adminSegment } from "@/lib/admin/sectores/segment";
import { requireSuperadmin } from "@/lib/auth/require-superadmin";

export const instant = false;

export default async function AdminModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ modulo: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  await requireSuperadmin();
  const { modulo } = await params;
  const query = await searchParams;
  if (adminSegment(modulo, Object.keys(adminModules), false) === "module") {
    const moduleInfo = adminModules[modulo];
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

  const data = await listSectorCompanies(modulo, query.page);
  if (!data) notFound();
  return (
    <SectorCompanies
      name={data.sector.name}
      slug={data.sector.slug}
      rows={data.rows}
      page={data.page}
      total={data.total}
    />
  );
}
