"use client";

import { CreateCrmForm } from "@/app/admin/crm/create-form";
import { CrmBoard } from "@/app/admin/crm/crm-board";
import { CrmSessionBar } from "@/app/admin/crm/crm-session-bar";
import { type DataRow } from "@/components/admin/data-columns";
import { listCrumbs, PanelHeader } from "@/components/admin/panel-header";
import type { PathPending } from "@/lib/admin/crm/path-pending";
import { crmHref, type CrmVista } from "@/lib/admin/crm/query";
import type { SessionChoice } from "@/lib/admin/tablero/session-choices";

export function CrmList({
  rows,
  page,
  total,
  error,
  orgs,
  vista,
  estado,
  origen,
  sesion,
  choices,
  pending,
}: {
  rows: DataRow[];
  page: number;
  total: number;
  error?: string;
  orgs: { id: string; name: string }[];
  vista: CrmVista;
  estado: string;
  origen: string;
  sesion: string | null;
  choices: SessionChoice[];
  pending: PathPending[];
}) {
  const hrefFor = (input: Parameters<typeof crmHref>[0]) => crmHref({ ...input, sesion: sesion ?? undefined });
  return (
    <main className="px-8 py-8">
      <PanelHeader
        title="CRM"
        lead="Contactos de los organismos, y quien se registró solo y falta aceptarlo."
        crumbs={listCrumbs("CRM", "/admin/crm")}
        actions={<CreateCrmForm open={Boolean(error)} orgs={orgs} />}
      />
      {error ? <p className="mb-4 text-small text-mark">{error}</p> : null}
      <CrmSessionBar
        choices={choices}
        sessionId={sesion}
        keep={{
          ...(vista !== "tabla" ? { vista } : {}),
          ...(estado ? { estado } : {}),
          ...(origen ? { origen } : {}),
        }}
      />
      <CrmBoard rows={rows} page={page} total={total} vista={vista} estado={estado} origen={origen} hrefFor={hrefFor} pending={pending} />
    </main>
  );
}
