import { LinkRows } from "@/app/admin/organismos/[id]/link-rows";
import { MemberRows } from "@/app/admin/organismos/[id]/member-rows";
import { OrganismoLogoTab } from "@/app/admin/organismos/[id]/logo-tab";
import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";
import { SessionPick } from "@/components/session-pick";
import { Button } from "@/components/ui/button";
import type { OrganismoLink } from "@/lib/admin/organismos/link-rows";

export function OrganismoTabs({
  id,
  active,
  enlace,
  data,
}: {
  id: string;
  active: string;
  enlace?: string;
  data: {
    members: { id: string; role: string; email: string | null; full_name: string | null }[];
    copies: OrganismoLink[];
    sectors: { id: string; name: string | null }[];
    sessions: { id: string; label: string }[];
    logo: { object_path: string } | null;
  };
}) {
  if (active === "miembros") return <MemberRows members={data.members} />;
  if (active === "enlace") {
    return (
      <div className="grid gap-4">
        {enlace ? <p data-testid="enlace-evento">{enlace}</p> : null}
        <FormSheet
          action="Crear"
          resource="enlace"
          open={Boolean(enlace)}
          trigger={
            <Button type="button" size="sm" className="w-fit">
              Crear enlace
            </Button>
          }
        >
          <form action={`/api/admin/organismos/${id}/enlace`} method="post" className="grid gap-3">
            <select name="sector_id" className="h-9 rounded-md border border-line bg-elevated px-3 text-small">
              {data.sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
            <SessionPick sessions={data.sessions} />
            <SheetSubmit>Copiar enlace del evento</SheetSubmit>
          </form>
        </FormSheet>
        <LinkRows links={data.copies} />
      </div>
    );
  }
  return <OrganismoLogoTab id={id} logo={data.logo} />;
}
