import { ActivityTab } from "@/app/admin/organismos/[id]/activity-tab";
import { OrganismoCrm } from "@/app/admin/organismos/[id]/organismo-crm";
import { OrganismoHeader } from "@/app/admin/organismos/[id]/organismo-header";
import { OrganismoTabNav } from "@/app/admin/organismos/[id]/organismo-tab-nav";
import { OrganismoTabs } from "@/app/admin/organismos/[id]/tabs";
import { type DataRow } from "@/components/admin/data-columns";
import { PanelHeader, parentLabel, trailCrumbs } from "@/components/admin/panel-header";
import { type CrmVista } from "@/lib/admin/crm/query";
import type { loadOrganismoActivity } from "@/lib/admin/organismos/activity";

type Data = Parameters<typeof OrganismoTabs>[0]["data"] & {
  org: { name: string | null; brand_color: string | null; brand_completed_at: string | null };
  contactCount: number;
};

type Activity = Awaited<ReturnType<typeof loadOrganismoActivity>>;

export function OrganismoScreen({
  id,
  data,
  active,
  enlace,
  crm,
  activity,
  vista,
  estado,
  origen,
}: {
  id: string;
  data: Data;
  active: string;
  enlace?: string;
  crm: { rows: DataRow[]; page: number; total: number } | null;
  activity: Activity | null;
  vista: CrmVista;
  estado: string;
  origen: string;
}) {
  const name = data.org.name ?? id;
  return (
    <main className="px-8 py-8">
      <PanelHeader title={name} crumbs={trailCrumbs(parentLabel("/admin/organismos"), "/admin/organismos", name)} />
      <OrganismoHeader
        name={name}
        logoUrl={data.logo ? `/api/admin/organismos/${id}/logo` : ""}
        color={data.org.brand_color ?? ""}
        brand={data.org.brand_completed_at ? "Lista" : "Incompleta"}
        members={data.members.length}
        contacts={data.contactCount}
        copies={data.copies.length}
      />
      <OrganismoTabNav id={id} active={active} contactCount={data.contactCount} />
      <div className="mt-6">
        {activity ? (
          <ActivityTab stats={activity} color={data.org.brand_color} />
        ) : crm ? (
          <OrganismoCrm id={id} rows={crm.rows} page={crm.page} total={crm.total} vista={vista} estado={estado} origen={origen} />
        ) : (
          <OrganismoTabs id={id} active={active} data={data} enlace={enlace} />
        )}
      </div>
    </main>
  );
}
