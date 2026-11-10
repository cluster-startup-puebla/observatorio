"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartPanel } from "@/app/admin/tablero/chart-panel";
import { ChartContainer } from "@/components/ui/chart";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart-tooltip";
import { brandBackground } from "@/lib/organismo/brand-color";

export function OpensChart({
  bars,
  hint = "Aperturas y conversiones del enlace en los últimos 14 días.",
  color,
}: {
  bars: { dia: string; aperturas: number; conversiones: number }[];
  hint?: string;
  color?: string;
}) {
  const brand = brandBackground(color);
  const config = {
    aperturas: { label: "Aperturas", color: brand },
    conversiones: { label: "Conversiones", color: `color-mix(in srgb, ${brand} 55%, #16284f)` },
  };
  return (
    <ChartPanel title="Aperturas y conversiones" hint={hint}>
      <div className="mb-3 flex gap-4 text-xs text-ink-secondary">
        <ChartKey color={config.aperturas.color} label="Aperturas" />
        <ChartKey color={config.conversiones.color} label="Conversiones" />
      </div>
      <ChartContainer config={config} className="aspect-auto h-72 w-full">
        <BarChart accessibilityLayer data={bars} margin={{ left: 0, right: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="dia" tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="aperturas" fill="var(--color-aperturas)" radius={4} />
          <Bar dataKey="conversiones" fill="var(--color-conversiones)" radius={4} />
        </BarChart>
      </ChartContainer>
    </ChartPanel>
  );
}

function ChartKey({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}
