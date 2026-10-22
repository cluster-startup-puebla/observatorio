"use client";

import { CuentaRowActions } from "@/app/admin/cuentas/row-actions";
import { StaffForm } from "@/app/admin/cuentas/staff-form";
import { DataList } from "@/components/admin/data-list";

export function CuentasList({
  rows,
  page,
  orgs,
  error,
}: {
  rows: Record<string, string>[];
  page: number;
  orgs: { id: string; name: string }[];
  error?: string;
}) {
  return (
    <DataList
      title="Cuentas"
      lead="Perfiles de los seis roles. El alta pública no elige staff."
      columns={[
        { key: "full_name", label: "Nombre" },
        { key: "email", label: "Correo" },
        { key: "role", label: "Rol" },
        { key: "onboarded_at", label: "Perfil" },
      ]}
      rows={rows}
      page={page}
      basePath="/admin/cuentas"
      error={error}
      rowActions={(row) => <CuentaRowActions row={row} orgs={orgs} />}
    >
      <StaffForm orgs={orgs} error={error ?? ""} />
    </DataList>
  );
}
