"use client";

import { CreateSessionForm } from "@/app/admin/sesiones/create-form";
import { SesionRowActions } from "@/app/admin/sesiones/row-actions";
import { DataList } from "@/components/admin/data-list";

export function SesionesList({
  rows,
  page,
  total,
  error,
  sectors,
  instruments,
  quotasBySession,
}: {
  rows: Record<string, string>[];
  page: number;
  total: number;
  error?: string;
  sectors: { id: string; name: string; slug: string }[];
  instruments: { id: string; label: string }[];
  quotasBySession: Record<string, Record<string, number>>;
}) {
  return (
    <DataList
      title="Sesiones"
      lead="La sesión, su tipo, plantilla y el cupo de invitados."
      columns={[
        { key: "title", label: "Título" },
        { key: "kind", label: "Plantilla" },
        { key: "modality", label: "Tipo" },
        { key: "session_on_label", label: "Fecha" },
        { key: "starts_local", label: "Empieza" },
        { key: "is_current", label: "Vigente" },
      ]}
      rows={rows}
      page={page}
      total={total}
      basePath="/admin/sesiones"
      error={error}
      rowActions={(row) => (
        <SesionRowActions
          row={row}
          sectors={sectors}
          quotas={quotasBySession[row.id] ?? {}}
          instruments={instruments}
        />
      )}
    >
      <CreateSessionForm open={Boolean(error)} sectors={sectors} instruments={instruments} />
    </DataList>
  );
}
