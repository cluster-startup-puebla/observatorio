"use client";

import { Pencil } from "lucide-react";
import { EditSessionForm } from "@/app/admin/sesiones/[id]/edit-form";
import { RowActions } from "@/components/admin/row-actions";
import { Button } from "@/components/ui/button";

export function SesionRowActions({
  row,
  sectors,
  quotas,
  instruments,
}: {
  row: Record<string, string>;
  sectors: { id: string; name: string; slug: string }[];
  quotas: Record<string, number>;
  instruments: { id: string; label: string }[];
}) {
  return (
    <RowActions
      href={`/admin/sesiones/${row.id}`}
      deleteAction={`/api/admin/sesiones/${row.id}`}
      deleteLabel={row.venue || "esta sesión"}
      edit={
        <EditSessionForm
          id={row.id}
          row={row}
          sectors={sectors}
          quotas={quotas}
          instruments={instruments}
          trigger={
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Editar">
              <Pencil className="size-4" />
            </Button>
          }
        />
      }
    />
  );
}
