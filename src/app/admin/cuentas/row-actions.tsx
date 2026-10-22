"use client";

import { Pencil } from "lucide-react";
import { RoleForm } from "@/app/admin/cuentas/[id]/role-form";
import { RowActions } from "@/components/admin/row-actions";
import { Button } from "@/components/ui/button";

export function CuentaRowActions({
  row,
  orgs,
}: {
  row: Record<string, string>;
  orgs: { id: string; name: string | null }[];
}) {
  return (
    <RowActions
      href={`/admin/cuentas/${row.id}`}
      deleteAction={`/api/admin/cuentas/${row.id}`}
      deleteLabel={row.full_name || row.email || "esta cuenta"}
      edit={
        <RoleForm
          id={row.id}
          role={row.role}
          organizationId={row.organization_id}
          fullName={row.full_name}
          jobTitle={row.job_title}
          whatsapp={row.whatsapp}
          orgs={orgs}
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
