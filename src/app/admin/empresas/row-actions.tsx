"use client";

import { Pencil } from "lucide-react";
import { EditEmpresaForm } from "@/app/admin/empresas/[id]/edit-form";
import { RowActions } from "@/components/admin/row-actions";
import { Button } from "@/components/ui/button";

export function EmpresaRowActions({
  row,
  sectors,
}: {
  row: Record<string, string>;
  sectors: { id: string; name: string }[];
}) {
  return (
    <RowActions
      href={`/admin/empresas/${row.id}`}
      deleteAction={`/api/admin/empresas/${row.id}`}
      deleteLabel={row.legal_name || "esta empresa"}
      edit={
        <EditEmpresaForm
          id={row.id}
          legalName={row.legal_name}
          band={row.band}
          sectorId={row.sector_id}
          referral={row.referral_source}
          sectors={sectors}
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
