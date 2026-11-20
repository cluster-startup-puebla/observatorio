"use client";

import { Pencil } from "lucide-react";
import { ActionForm } from "@/app/admin/lavas/action-form";
import { DataList } from "@/components/admin/data-list";
import { Button } from "@/components/ui/button";
import type { LavaActionRow } from "@/lib/admin/lavas/list-actions";

export function ActionsList({
  rows,
  edit,
  error,
  children,
}: {
  rows: LavaActionRow[];
  edit?: string;
  error?: string;
  children?: React.ReactNode;
}) {
  return (
    <DataList
      title="Lavas"
      lead="Catálogo, boost EIA y ajustes. No definen el estatus EIA."
      columns={[
        { key: "label", label: "Acción" },
        { key: "base_value", label: "Lavas" },
        { key: "repeatable_label", label: "Repetición" },
        { key: "eia_boost", label: "Boost EIA" },
        { key: "active", label: "Activa" },
      ]}
      rows={rows}
      page={1}
      total={rows.length}
      basePath="/admin/lavas"
      error={error && !edit ? error : undefined}
      rowActions={(row) => (
        <ActionForm
          open={edit === row.code}
          error={edit === row.code ? error : undefined}
          row={{
            code: row.code,
            label: row.label,
            base_value: row.base_value,
            once: row.once === "Sí",
            eia_boost: row.eia_boost === "Sí",
            condition_label: row.condition_label,
            repeatable_label: row.repeatable_label,
            active: row.active === "Sí",
            sort_order: row.sort_order,
          }}
          trigger={
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Editar">
              <Pencil className="size-4" />
            </Button>
          }
        />
      )}
    >
      {children}
    </DataList>
  );
}
