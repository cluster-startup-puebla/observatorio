"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartPanel } from "@/app/admin/tablero/chart-panel";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { sectorChartRows } from "@/lib/admin/tablero/sector-chart-rows";
import type { OmittedSector, SectorFillRow } from "@/lib/admin/tablero/sector-fill";

const config = {
  cupo: { label: "Cupo", color: "var(--brand-secondary)" },
  ocupados: { label: "Ocupados", color: "var(--brand-primary)" },
  pendientes: { label: "Pendientes", color: "var(--warning)" },
} satisfies ChartConfig;

export function SectorChart({ rows, outside }: { rows: SectorFillRow[]; outside: OmittedSector[] }) {
  const data = sectorChartRows(rows, outside);
  return (
    <ChartPanel
      title="Por sector"
      hint="Lugares de la sesión contra quienes ocupan y quienes esperan. Al final, sectores que se registraron sin estar en la lista: su cupo queda en cero."
    >
      {data.length === 0 ? (
        <p className="text-small text-ink-secondary">No hay sesión vigente.</p>
      ) : (
        <>
          <SectorLegend />
          <ChartContainer config={config} className="aspect-auto w-full" style={{ height: Math.max(240, data.length * 48) }}>
            <BarChart data={data} layout="vertical" margin={{ left: 4, right: 8 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="sector" width={128} tickLine={false} axisLine={false} tickFormatter={shortName} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="cupo" fill="var(--color-cupo)" radius={4} />
              <Bar dataKey="ocupados" fill="var(--color-ocupados)" radius={4} />
              <Bar dataKey="pendientes" fill="var(--color-pendientes)" radius={4} />
            </BarChart>
          </ChartContainer>
        </>
      )}
    </ChartPanel>
  );
}

function SectorLegend() {
  return (
    <div className="mb-4 flex flex-wrap gap-4 text-small text-ink-secondary">
      <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-sm bg-navy" />Cupo</span>
      <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-sm bg-brand" />Ocupados</span>
      <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-sm bg-[var(--warning)]" />Pendientes</span>
    </div>
  );
}

function shortName(value: string) {
  return value.length > 18 ? `${value.slice(0, 17)}…` : value;
}
