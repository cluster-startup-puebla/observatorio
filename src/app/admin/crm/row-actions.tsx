"use client";

import { Pencil } from "lucide-react";
import { EditCrmForm } from "@/app/admin/crm/[id]/edit-form";
import { RowActions } from "@/components/admin/row-actions";
import { Button } from "@/components/ui/button";

export function CrmRowActions({ row }: { row: Record<string, string> }) {
  return (
    <RowActions
      href={`/admin/crm/${row.id}`}
      deleteAction={`/api/admin/crm/${row.id}`}
      deleteLabel={row.nombre || "este contacto"}
      edit={
        <EditCrmForm
          id={row.id}
          nombre={row.nombre}
          empresa={row.empresa}
          email={row.email}
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
