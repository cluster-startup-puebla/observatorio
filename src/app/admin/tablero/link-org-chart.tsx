"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartPanel } from "@/app/admin/tablero/chart-panel";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { LinkOrgBar } from "@/lib/admin/tablero/types";

const config = {
  enlaces: { label: "Enlaces", color: "var(--brand-secondary)" },
  pendientes: { label: "Pendientes", color: "var(--warning)" },
} satisfies ChartConfig;

export function LinkOrgChart({ rows }: { rows: LinkOrgBar[] }) {
  return (
    <ChartPanel title="Enlaces por organismo" hint="Quienes se registraron con el enlace y cuántos siguen pendientes.">
      {rows.length === 0 ? (
        <p className="text-small text-ink-secondary">Todavía no hay registros por enlace.</p>
      ) : (
        <>
          <LinkLegend />
          <ChartContainer config={config} className="aspect-auto w-full" style={{ height: Math.max(240, rows.length * 48) }}>
            <BarChart data={rows} layout="vertical" margin={{ left: 4, right: 8 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="organismo" width={128} tickLine={false} axisLine={false} tickFormatter={shortName} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="enlaces" fill="var(--color-enlaces)" radius={4} />
              <Bar dataKey="pendientes" fill="var(--color-pendientes)" radius={4} />
            </BarChart>
          </ChartContainer>
        </>
      )}
    </ChartPanel>
  );
}

function LinkLegend() {
  return (
    <div className="mb-4 flex flex-wrap gap-4 text-small text-ink-secondary">
      <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-sm bg-navy" />Enlaces</span>
      <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-sm bg-[var(--warning)]" />Pendientes</span>
    </div>
  );
}

function shortName(value: string) {
  return value.length > 18 ? `${value.slice(0, 17)}…` : value;
}
