"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartPanel } from "@/app/admin/tablero/chart-panel";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { PaceRow } from "@/lib/admin/tablero/types";

const config = {
  confirmaciones: { label: "Confirmaciones", color: "var(--brand-primary)" },
} satisfies ChartConfig;

export function PaceChart({ rows }: { rows: PaceRow[] }) {
  return (
    <ChartPanel title="Confirmaciones por día" hint="Hechos de confirmar en los últimos 14 días.">
      <ChartContainer config={config} className="aspect-auto h-72 w-full">
        <BarChart data={rows} margin={{ left: 0, right: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="dia" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="confirmaciones" fill="var(--color-confirmaciones)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartPanel>
  );
}
