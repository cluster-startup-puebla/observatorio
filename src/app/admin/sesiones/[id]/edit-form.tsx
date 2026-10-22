"use client";

import { SessionFields } from "@/app/admin/sesiones/session-fields";
import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function EditSessionForm({
  id,
  row,
  sectors,
  quotas,
  open,
  trigger,
}: {
  id: string;
  row: Record<string, string>;
  sectors: { id: string; name: string; slug: string }[];
  quotas: Record<string, number>;
  open?: boolean;
  trigger?: React.ReactNode;
}) {
  return (
    <FormSheet action="Editar" resource="sesión" open={open} trigger={trigger}>
      <form action={`/api/admin/sesiones/${id}`} method="post" className="grid gap-3">
        <SessionFields
          sectors={sectors}
          quotas={quotas}
          defaults={{
            venue: row.venue,
            format_name: row.format_name,
            starts_local: row.starts_local,
            ends_local: row.ends_local,
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
