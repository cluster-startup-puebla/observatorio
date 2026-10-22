"use client";

import { Pencil } from "lucide-react";
import { EditInvitacionForm } from "@/app/admin/invitaciones/[id]/edit-form";
import { RowActions } from "@/components/admin/row-actions";
import { Button } from "@/components/ui/button";

export function InvitacionRowActions({ row }: { row: Record<string, string> }) {
  return (
    <RowActions
      href={`/admin/invitaciones/${row.id}`}
      deleteAction={`/api/admin/invitaciones/${row.id}`}
      deleteLabel={row.nombre || "esta invitación"}
      edit={
        <EditInvitacionForm
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
