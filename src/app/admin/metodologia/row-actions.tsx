"use client";

import { Pencil } from "lucide-react";
import { EditSectionForm } from "@/app/admin/metodologia/edit-section-form";
import { RowActions } from "@/components/admin/row-actions";
import { Button } from "@/components/ui/button";

export function MetodologiaRowActions({ row }: { row: Record<string, string> }) {
  return (
    <RowActions
      href={`/admin/metodologia/${row.id}`}
      edit={
        <EditSectionForm
          id={row.id}
          name={row.name}
          rangeKind={row.range_kind}
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
