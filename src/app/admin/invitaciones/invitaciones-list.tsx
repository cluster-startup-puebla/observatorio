"use client";

import { InvitacionRowActions } from "@/app/admin/invitaciones/row-actions";
import { ManualInviteForm } from "@/app/admin/invitaciones/manual-form";
import { UploadForm } from "@/app/admin/invitaciones/upload-form";
import { DataList } from "@/components/admin/data-list";

export function InvitacionesList({
  rows,
  page,
  error,
  orgs,
}: {
  rows: Record<string, string>[];
  page: number;
  error?: string;
  orgs: { id: string; name: string }[];
}) {
  return (
    <DataList
      title="Invitaciones"
      lead="Carga de Excel y alta a mano."
      columns={[
        { key: "nombre", label: "Nombre" },
        { key: "empresa", label: "Empresa" },
        { key: "email", label: "Correo" },
        { key: "source", label: "Origen" },
      ]}
      rows={rows}
      page={page}
      basePath="/admin/invitaciones"
      error={error}
      rowActions={(row) => <InvitacionRowActions row={row} />}
    >
      <UploadForm orgs={orgs} open={Boolean(error)} />
      <ManualInviteForm orgs={orgs} />
    </DataList>
  );
}
