import Link from "next/link";
import { CupoKpis } from "@/app/admin/tablero/cupo-kpis";
import { FunnelChart } from "@/app/admin/tablero/funnel-chart";
import { TableroKpis } from "@/app/admin/tablero/kpis";
import { OrgChart } from "@/app/admin/tablero/org-chart";
import { PaceChart } from "@/app/admin/tablero/pace-chart";
import { SectorChart } from "@/app/admin/tablero/sector-chart";
import { SessionSelect } from "@/app/admin/tablero/session-select";
import { TableroSignals } from "@/app/admin/tablero/signals";
import { cupoSignals, type Signal } from "@/lib/admin/tablero/reading";
import type { SessionChoice } from "@/lib/admin/tablero/session-choices";
import type { SectorFillRow } from "@/lib/admin/tablero/sector-fill";
import type { Tablero } from "@/lib/admin/tablero/types";

type Cupos = {
  cupo: number;
  ocupados: number;
  pendientes: number;
  rows: SectorFillRow[];
  session: { id: string } | null;
};

export function TableroBoard({ board, cupos, choices }: { board: Tablero; cupos: Cupos; choices: SessionChoice[] }) {
  return (
    <div data-testid="tablero" className="grid gap-6">
      <TableroKpis board={board} />
      <TableroSignals board={board} />
      <SessionSelect choices={choices} selectedId={cupos.session?.id ?? null} />
      <CupoKpis fill={cupos} />
      <CupoAlerts rows={cupos.rows} />
      <SectorChart rows={cupos.rows} />
      <div className="grid gap-6 lg:grid-cols-2">
        <FunnelChart rows={board.funnel} />
        <PaceChart rows={board.pace} />
      </div>
      <OrgChart rows={board.byOrg} />
    </div>
  );
}

function CupoAlerts({ rows }: { rows: SectorFillRow[] }) {
  const items = cupoSignals(rows);
  if (items.length === 0) return null;
  const columns = items.length > 1 ? "lg:grid-cols-3" : "";
  return (
    <section className={`grid gap-3 ${columns}`}>
      {items.map((item) => (
        <SignalLink key={item.text} item={item} />
      ))}
    </section>
  );
}

function SignalLink({ item }: { item: Signal }) {
  return (
    <Link href={item.href} className="rounded-2xl border border-line bg-elevated p-4">
      <p className="text-small text-ink">{item.text}</p>
      <span className="mt-3 inline-block text-small text-link">{item.label}</span>
    </Link>
  );
}
