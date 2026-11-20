"use client";

import { DataList } from "@/components/admin/data-list";
import { RetoRowActions } from "./row-actions";

export function RetosList({
  rows,
  page,
  total,
}: {
  rows: Record<string, string>[];
  page: number;
  total: number;
}) {
  return (
    <DataList
      title="Retos"
      lead="Modera retos publicados por empresas. Ocultar no revierte lavas."
      columns={[
        { key: "name", label: "Nombre" },
        { key: "empresa", label: "Empresa" },
        { key: "area", label: "Área" },
        { key: "status", label: "Estado" },
        { key: "visibility", label: "Visibilidad" },
        { key: "show_company", label: "Atribuye" },
      ]}
      rows={rows}
      page={page}
      total={total}
      basePath="/admin/retos"
      rowActions={(row) => <RetoRowActions row={row} />}
    />
  );
}
