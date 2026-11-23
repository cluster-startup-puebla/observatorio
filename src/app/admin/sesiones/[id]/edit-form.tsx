"use client";

import { SessionFields } from "@/app/admin/sesiones/session-fields";
import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function EditSessionForm({
  id,
  row,
  sectors,
  quotas,
  instruments,
  open,
  trigger,
}: {
  id: string;
  row: Record<string, string>;
  sectors: { id: string; name: string; slug: string }[];
  quotas: Record<string, number>;
  instruments: { id: string; label: string }[];
  open?: boolean;
  trigger?: React.ReactNode;
}) {
  return (
    <FormSheet action="Editar" resource="sesión" open={open} trigger={trigger}>
      <form action={`/api/admin/sesiones/${id}`} method="post" className="grid gap-3">
        <SessionFields
          sectors={sectors}
          quotas={quotas}
          instruments={instruments}
          defaults={{
            title: row.title,
            venue: row.venue,
            format_name: row.format_name,
            modality: row.modality_value || row.modality,
            kind: row.kind_value || row.kind,
            instrument_id: row.instrument_id,
            session_on: row.session_on,
            starts_local: row.starts_local,
            ends_local: row.ends_local,
            time_zone: row.time_zone,
            capacity_min: row.capacity_min,
            capacity_max: row.capacity_max,
            audience: row.audience,
            includes: row.includes,
            is_current: row.current_flag === "1",
          }}
        />
        <SheetSubmit>Guardar sesión</SheetSubmit>
      </form>
    </FormSheet>
  );
}
