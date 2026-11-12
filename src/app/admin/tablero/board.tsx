import Link from "next/link";
import { CupoKpis } from "@/app/admin/tablero/cupo-kpis";
import { LogoAside } from "@/app/admin/tablero/logo-aside";
import { TableroKpis } from "@/app/admin/tablero/kpis";
import { LinkOrgChart } from "@/app/admin/tablero/link-org-chart";
import { PaceChart } from "@/app/admin/tablero/pace-chart";
import { UnconvenedCard } from "@/app/admin/tablero/unconvened-card";
import { SectorChart } from "@/app/admin/tablero/sector-chart";
import { SessionSelect } from "@/app/admin/tablero/session-select";
import { TableroSignals } from "@/app/admin/tablero/signals";
import { cupoSignals, type Signal } from "@/lib/admin/tablero/reading";
import type { ShowableLogo } from "@/lib/admin/empresas/event-logos";
import type { DataRow } from "@/components/admin/data-columns";
import type { SessionChoice } from "@/lib/admin/tablero/session-choices";
import type { OmittedSector, SectorFillRow } from "@/lib/admin/tablero/sector-fill";
import type { Tablero } from "@/lib/admin/tablero/types";

type Cupos = {
  cupo: number;
  ocupados: number;
  pendientes: number;
  omitidos: OmittedSector[];
  companies: DataRow[];
  rows: SectorFillRow[];
  session: { id: string } | null;
};

export function TableroBoard({
  board,
  cupos,
  choices,
  logos,
}: {
  board: Tablero;
  cupos: Cupos;
  choices: SessionChoice[];
  logos: ShowableLogo[];
}) {
  const columns = logos.length > 0 ? "lg:grid-cols-[minmax(0,1fr)_18rem]" : "";
  return (
    <div data-testid="tablero" className={`grid items-start gap-6 ${columns}`}>
      <div className="grid gap-6">
        <TableroKpis board={board} />
        {board.invitations > 0 ? <TableroSignals board={board} /> : null}
        <SessionSelect choices={choices} selectedId={cupos.session?.id ?? null} />
        <CupoKpis fill={cupos} />
        <UnconvenedCard rows={cupos.omitidos} companies={cupos.companies} />
        <CupoAlerts rows={cupos.rows} />
        <SectorChart rows={cupos.rows} />
        <div className="grid gap-6 lg:grid-cols-2">
          <PaceChart rows={board.pace} />
          <LinkOrgChart rows={board.byLinkOrg} />
        </div>
      </div>
      <LogoAside logos={logos} />
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
