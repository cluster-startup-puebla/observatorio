"use client";

import { Pencil } from "lucide-react";
import { ReplaceMedioForm } from "@/app/admin/medios/replace-form";
import { RowActions } from "@/components/admin/row-actions";
import { Button } from "@/components/ui/button";

export function MedioRowActions({ row }: { row: Record<string, string> }) {
  return (
    <RowActions
      href={`/admin/medios/${row.id}`}
      edit={
        <ReplaceMedioForm
          id={row.id}
          purpose={row.purpose_label || row.purpose}
          trigger={
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Reemplazar">
              <Pencil className="size-4" />
            </Button>
          }
        />
      }
    />
  );
}
