"use client";

import { CreateCrmForm } from "@/app/admin/crm/create-form";
import { CrmBoard } from "@/app/admin/crm/crm-board";
import { type DataRow } from "@/components/admin/data-columns";
import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import { crmHref, type CrmVista } from "@/lib/admin/crm/query";

export function CrmList({
  rows,
  page,
  total,
  error,
  orgs,
  vista,
  estado,
  origen,
}: {
  rows: DataRow[];
  page: number;
  total: number;
  error?: string;
  orgs: { id: string; name: string }[];
  vista: CrmVista;
  estado: string;
  origen: string;
}) {
  return (
    <main className="px-8 py-8">
      <PanelHeader
        title="CRM"
        lead="Contactos de todos los organismos. El estatus sale de los hechos."
        crumbs={listCrumbs("CRM", "/admin/crm")}
        actions={<CreateCrmForm open={Boolean(error)} orgs={orgs} />}
      />
      {error ? <p className="mb-4 text-small text-mark">{error}</p> : null}
      <CrmBoard rows={rows} page={page} total={total} vista={vista} estado={estado} origen={origen} hrefFor={crmHref} />
    </main>
  );
}
