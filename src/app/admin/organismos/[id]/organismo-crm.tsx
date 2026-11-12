"use client";

import { CrmBoard } from "@/app/admin/crm/crm-board";
import { organismoCrmHref, type CrmLink, type CrmVista } from "@/lib/admin/crm/query";
import type { DataRow } from "@/components/admin/data-columns";

export function OrganismoCrm({
  id,
  rows,
  page,
  total,
  vista,
  estado,
  origen,
}: {
  id: string;
  rows: DataRow[];
  page: number;
  total: number;
  vista: CrmVista;
  estado: string;
  origen: string;
}) {
  const hrefFor = (input: CrmLink) => organismoCrmHref(id, input);
  return <CrmBoard rows={rows} page={page} total={total} vista={vista} estado={estado} origen={origen} hrefFor={hrefFor} />;
}
