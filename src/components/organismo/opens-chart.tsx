"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartPanel } from "@/app/admin/tablero/chart-panel";
import { ChartContainer } from "@/components/ui/chart";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart-tooltip";

const config = { aperturas: { label: "Aperturas", color: "var(--ink)" } };

export function OpensChart({
  bars,
  hint = "Visitas al enlace en los últimos 14 días.",
}: {
  bars: { dia: string; aperturas: number }[];
  hint?: string;
}) {
  return (
    <ChartPanel title="Aperturas por día" hint={hint}>
      <ChartContainer config={config} className="aspect-auto h-72 w-full">
        <BarChart accessibilityLayer data={bars} margin={{ left: 0, right: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="dia" tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="aperturas" fill="var(--color-aperturas)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartPanel>
  );
}
