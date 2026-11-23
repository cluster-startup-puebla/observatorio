"use client";

import { ListSearch } from "@/components/admin/list-search";
import { SectorFilter } from "@/components/admin/sector-filter";

export function PasesToolbar({
  q,
  sector,
  sectors,
}: {
  q?: string;
  sector?: string;
  sectors: { id: string; name: string }[];
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <ListSearch
        basePath="/admin/pases"
        q={q}
        extras={{ sector }}
        placeholder="Nombre, empresa o correo…"
      />
      <SectorFilter basePath="/admin/pases" q={q} sector={sector} sectors={sectors} />
    </div>
  );
}
