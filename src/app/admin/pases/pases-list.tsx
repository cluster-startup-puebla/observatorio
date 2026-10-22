"use client";

import { RowActions } from "@/components/admin/row-actions";
import { DataList } from "@/components/admin/data-list";

export function PasesList({ rows, page }: { rows: Record<string, string>[]; page: number }) {
  return (
    <DataList
      title="Pases y llegadas"
      lead="El pase se emite al terminar el perfil. Aquí se revisa el QR, la llegada y se puede borrar."
      columns={[
        { key: "profile_id", label: "Perfil" },
        { key: "issued_at", label: "Emitido" },
        { key: "llegada", label: "Llegada" },
      ]}
      rows={rows}
      page={page}
      basePath="/admin/pases"
      rowActions={(row) => (
        <RowActions
          href={`/admin/pases/${row.id}`}
          deleteAction={`/api/admin/pases/${row.id}`}
          deleteLabel="este pase"
        />
      )}
    />
  );
}
