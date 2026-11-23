"use client";

import { CreateEmpresaForm } from "@/app/admin/empresas/create-form";
import { EmpresaRowActions } from "@/app/admin/empresas/row-actions";
import { DataList } from "@/components/admin/data-list";
import { ListSearch } from "@/components/admin/list-search";

export function EmpresasList({
  rows,
  page,
  total,
  q,
  error,
  sectors,
  profiles,
}: {
  rows: Record<string, string>[];
  page: number;
  total: number;
  q?: string;
  error?: string;
  sectors: { id: string; name: string }[];
  profiles: { id: string; email: string }[];
}) {
  return (
    <DataList
      title="Empresas"
      lead="La empresa ligada a un empresario y su sector."
      columns={[
        { key: "logo", label: "Logo", image: true },
        { key: "legal_name", label: "Razón social" },
        { key: "employee_band", label: "Tamaño" },
        { key: "sector_name", label: "Sector" },
        { key: "convoco", label: "Convocó", links: true },
        { key: "llegada", label: "Llegada" },
        { key: "aprobacion", label: "Verificación" },
      ]}
      rows={rows}
      page={page}
      total={total}
      basePath="/admin/empresas"
      q={q}
      error={error}
      toolbar={
        <ListSearch
          basePath="/admin/empresas"
          q={q}
          placeholder="Razón social…"
        />
      }
      rowActions={(row) => <EmpresaRowActions row={row} sectors={sectors} />}
    >
      <CreateEmpresaForm open={Boolean(error)} sectors={sectors} profiles={profiles} />
    </DataList>
  );
}
