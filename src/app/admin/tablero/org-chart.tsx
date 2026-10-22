"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartPanel } from "@/app/admin/tablero/chart-panel";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { OrgBar } from "@/lib/admin/tablero/types";

const config = {
  invitaciones: { label: "Invitaciones", color: "var(--brand-secondary)" },
  confirmaciones: { label: "Confirmaciones", color: "var(--brand-primary)" },
} satisfies ChartConfig;

export function OrgChart({ rows }: { rows: OrgBar[] }) {
  return (
    <ChartPanel title="Por organismo" hint="Invitaciones contra las que ya confirmaron.">
      {rows.length === 0 ? (
        <p className="text-small text-ink-secondary">Todavía no hay invitaciones por organismo.</p>
      ) : (
        <>
          <OrgLegend />
          <ChartContainer config={config} className="aspect-auto w-full" style={{ height: Math.max(240, rows.length * 48) }}>
            <BarChart data={rows} layout="vertical" margin={{ left: 4, right: 8 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="organismo" width={128} tickLine={false} axisLine={false} tickFormatter={shortName} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="invitaciones" fill="var(--color-invitaciones)" radius={4} />
              <Bar dataKey="confirmaciones" fill="var(--color-confirmaciones)" radius={4} />
            </BarChart>
          </ChartContainer>
        </>
      )}
    </ChartPanel>
  );
}

function OrgLegend() {
  return (
    <div className="mb-4 flex flex-wrap gap-4 text-small text-ink-secondary">
      <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-sm bg-navy" />Invitaciones</span>
      <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-sm bg-brand" />Confirmaciones</span>
    </div>
  );
}

function shortName(value: string) {
  return value.length > 18 ? `${value.slice(0, 17)}…` : value;
}
