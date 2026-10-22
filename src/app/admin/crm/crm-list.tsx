"use client";

import { CreateCrmForm } from "@/app/admin/crm/create-form";
import { CrmRowActions } from "@/app/admin/crm/row-actions";
import { DataList } from "@/components/admin/data-list";

export function CrmList({
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
      title="CRM"
      lead="Contactos de todos los organismos. El estatus sale de los hechos."
      columns={[
        { key: "nombre", label: "Nombre" },
        { key: "empresa", label: "Empresa" },
        { key: "email", label: "Correo" },
        { key: "source", label: "Origen" },
        { key: "status", label: "Estatus" },
      ]}
      rows={rows}
      page={page}
      basePath="/admin/crm"
      error={error}
      rowActions={(row) => <CrmRowActions row={row} />}
    >
      <CreateCrmForm open={Boolean(error)} orgs={orgs} />
    </DataList>
  );
}
