"use client";

import { CuentaMark } from "@/app/admin/cuentas/cuenta-mark";
import { CuentaRowActions } from "@/app/admin/cuentas/row-actions";
import { RolePillow } from "@/app/admin/cuentas/role-pillow";
import { StaffForm } from "@/app/admin/cuentas/staff-form";
import { DataList } from "@/components/admin/data-list";

export function CuentasList({
  rows,
  page,
  total,
  orgs,
  error,
}: {
  rows: Record<string, string>[];
  page: number;
  total: number;
  orgs: { id: string; name: string }[];
  error?: string;
}) {
  return (
    <DataList
      title="Cuentas"
      lead="Perfiles de los seis roles. El alta pública no elige staff."
      columns={[
        {
          key: "logo",
          label: "",
          className: "w-12",
          render: (row) => <CuentaMark src={row.logo} name={row.display_name || row.email} />,
        },
        { key: "display_name", label: "Nombre" },
        { key: "email", label: "Correo" },
        { key: "role", label: "Rol", render: (row) => <RolePillow role={row.role} /> },
        { key: "onboarded_at", label: "Perfil" },
      ]}
      rows={rows}
      page={page}
      total={total}
      basePath="/admin/cuentas"
      error={error}
      rowActions={(row) => <CuentaRowActions row={row} orgs={orgs} />}
    >
      <StaffForm orgs={orgs} error={error ?? ""} />
    </DataList>
  );
}
