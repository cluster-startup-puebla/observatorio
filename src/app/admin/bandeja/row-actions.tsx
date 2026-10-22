"use client";

import { RefreshCw } from "lucide-react";
import { RowActions } from "@/components/admin/row-actions";
import { Button } from "@/components/ui/button";

export function BandejaRowActions({ row }: { row: Record<string, string> }) {
  return (
    <RowActions
      href={`/admin/bandeja/${row.id}`}
      edit={
        <form action={`/api/admin/bandeja/${row.id}`} method="post">
          <Button type="submit" variant="ghost" size="icon-sm" aria-label="Reintentar envío">
            <RefreshCw className="size-4" />
          </Button>
        </form>
      }
    />
  );
}
