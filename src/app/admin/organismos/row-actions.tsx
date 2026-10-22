"use client";

import { Pencil } from "lucide-react";
import { EditOrganismoForm } from "@/app/admin/organismos/[id]/edit-form";
import { RowActions } from "@/components/admin/row-actions";
import { Button } from "@/components/ui/button";

export function OrganismoRowActions({
  id,
  name,
  color,
  open,
  error,
}: {
  id: string;
  name: string;
  color: string;
  open?: boolean;
  error?: string;
}) {
  return (
    <RowActions
      href={`/admin/organismos/${id}`}
      deleteAction={`/api/admin/organismos/${id}`}
      deleteLabel={name || "este organismo"}
      edit={
        <EditOrganismoForm
          id={id}
          name={name}
          color={color}
          open={open}
          error={error}
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
