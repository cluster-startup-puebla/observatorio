import { FunnelChart } from "@/app/admin/tablero/funnel-chart";
import { TableroKpis } from "@/app/admin/tablero/kpis";
import { OrgChart } from "@/app/admin/tablero/org-chart";
import { PaceChart } from "@/app/admin/tablero/pace-chart";
import { TableroSignals } from "@/app/admin/tablero/signals";
import type { Tablero } from "@/lib/admin/tablero/types";

export function TableroBoard({ board }: { board: Tablero }) {
  return (
    <div data-testid="tablero" className="grid gap-6">
      <TableroKpis board={board} />
      <TableroSignals board={board} />
      <div className="grid gap-6 lg:grid-cols-2">
        <FunnelChart rows={board.funnel} />
        <PaceChart rows={board.pace} />
      </div>
      <OrgChart rows={board.byOrg} />
    </div>
  );
}
