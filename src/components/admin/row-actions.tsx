"use client";

import { Eye } from "lucide-react";
import { DeleteControl } from "@/components/admin/delete-control";
import { Button } from "@/components/ui/button";

export function RowActions({
  href,
  edit,
  deleteAction,
  deleteLabel,
}: {
  href: string;
  edit?: React.ReactNode;
  deleteAction?: string;
  deleteLabel?: string;
}) {
  return (
    <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
      <Button variant="ghost" size="icon-sm" asChild>
        <a href={href} aria-label="Abrir">
          <Eye className="size-4" />
        </a>
      </Button>
      {edit}
      {deleteAction ? <DeleteControl action={deleteAction} label={deleteLabel ?? "este registro"} icon /> : null}
    </div>
  );
}
