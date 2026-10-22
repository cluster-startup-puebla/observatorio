"use client";

import { Pencil } from "lucide-react";
import { SectorPageForm } from "@/app/admin/sectores/page-form";
import { RowActions } from "@/components/admin/row-actions";
import { Button } from "@/components/ui/button";

export function SectorRowActions({ row }: { row: Record<string, string> }) {
  return (
    <RowActions
      href={`/admin/sectores/${row.id}`}
      deleteAction={`/api/admin/sectores/${row.id}`}
      deleteLabel={row.name || "este sector"}
      edit={
        <SectorPageForm
          id={row.id}
          name={row.name}
          headline={row.headline}
          body={row.body}
          trigger={
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Editar página">
              <Pencil className="size-4" />
            </Button>
          }
        />
      }
    />
  );
}
