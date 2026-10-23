"use client";

import { CreateSessionForm } from "@/app/admin/sesiones/create-form";
import { SesionRowActions } from "@/app/admin/sesiones/row-actions";
import { DataList } from "@/components/admin/data-list";

export function SesionesList({
  rows,
  page,
  error,
  sectors,
  quotasBySession,
}: {
  rows: Record<string, string>[];
  page: number;
  error?: string;
  sectors: { id: string; name: string; slug: string }[];
  quotasBySession: Record<string, Record<string, number>>;
}) {
  return (
    <DataList
      title="Sesiones"
      lead="La sesión, sus sectores y el cupo de invitados."
      columns={[
        { key: "venue", label: "Lugar" },
        { key: "format_name", label: "Formato" },
        { key: "session_on_label", label: "Fecha" },
        { key: "starts_local", label: "Empieza" },
        { key: "ends_local", label: "Termina" },
        { key: "is_current", label: "Vigente" },
      ]}
      rows={rows}
      page={page}
      basePath="/admin/sesiones"
      error={error}
      rowActions={(row) => (
        <SesionRowActions row={row} sectors={sectors} quotas={quotasBySession[row.id] ?? {}} />
      )}
    >
      <CreateSessionForm open={Boolean(error)} sectors={sectors} />
    </DataList>
  );
}
