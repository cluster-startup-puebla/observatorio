"use client";

import { ActionsList } from "@/app/admin/lavas/actions-list";
import type { LavaActionRow } from "@/lib/admin/lavas/list-actions";

export function LavasAdmin({
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
    <ActionsList rows={rows} edit={edit} error={error}>
      {children}
    </ActionsList>
  );
}
