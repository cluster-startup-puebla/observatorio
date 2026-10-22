"use client";

import { CreateEmpresaForm } from "@/app/admin/empresas/create-form";
import { EmpresaRowActions } from "@/app/admin/empresas/row-actions";
import { DataList } from "@/components/admin/data-list";

export function EmpresasList({
  rows,
  page,
  error,
  sectors,
  profiles,
}: {
  rows: Record<string, string>[];
  page: number;
  error?: string;
  sectors: { id: string; name: string }[];
  profiles: { id: string; email: string }[];
}) {
  return (
    <DataList
      title="Empresas"
      lead="La empresa del empresario y su perfil."
      columns={[
        { key: "legal_name", label: "Razón social" },
        { key: "employee_band", label: "Tamaño" },
        { key: "sector_name", label: "Sector" },
      ]}
      rows={rows}
      page={page}
      basePath="/admin/empresas"
      error={error}
      rowActions={(row) => <EmpresaRowActions row={row} sectors={sectors} />}
    >
      <CreateEmpresaForm open={Boolean(error)} sectors={sectors} profiles={profiles} />
    </DataList>
  );
}
