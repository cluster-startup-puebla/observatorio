"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { ChartPanel } from "@/app/admin/tablero/chart-panel";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { FunnelRow } from "@/lib/admin/tablero/types";

const config = { personas: { label: "Personas", color: "var(--brand-primary)" } } satisfies ChartConfig;

export function FunnelChart({ rows }: { rows: FunnelRow[] }) {
  return (
    <ChartPanel title="Dónde está la lista" hint="Estatus actual de cada invitación.">
      <ChartContainer config={config} className="aspect-auto h-72 w-full">
        <BarChart data={rows} layout="vertical" margin={{ left: 4, right: 8 }}>
          <CartesianGrid horizontal={false} />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="etapa" width={118} tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="personas" radius={4}>
            {rows.map((row) => (
              <Cell key={row.etapa} fill={row.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartPanel>
  );
}
