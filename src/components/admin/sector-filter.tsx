"use client";

import { useRouter } from "next/navigation";
import {
  sessionChevron,
  sessionSelectClass,
} from "@/components/admin/session-filter-styles";
import { listHref } from "@/lib/admin/list-query";

export function SectorFilter({
  basePath,
  q,
  sector,
  sectors,
}: {
  basePath: string;
  q?: string;
  sector?: string;
  sectors: { id: string; name: string }[];
}) {
  const router = useRouter();
  return (
    <label className="grid gap-1.5 text-small font-medium text-ink">
      Sector
      <select
        className={sessionSelectClass}
        style={{ backgroundImage: sessionChevron }}
        value={sector ?? ""}
        data-testid="sector-filter"
        onChange={(event) => {
          router.replace(
            listHref({
              basePath,
              q,
              page: 1,
              extras: { sector: event.target.value || undefined },
            }),
          );
        }}
      >
        <option value="">Todos</option>
        {sectors.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}
