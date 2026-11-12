"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartPanel } from "@/app/admin/tablero/chart-panel";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { OrgOpenSeries } from "@/lib/admin/tablero/org-open-bars";

const palette = ["#e8186a", "#16284f", "#b8860b", "#0f766e", "#7c3aed", "#0369a1", "#b45309", "#be185d"];

export function OrgOpenChart({
  bars,
  series,
}: {
  bars: Record<string, string | number>[];
  series: OrgOpenSeries[];
}) {
  const config = Object.fromEntries(
    series.map((item, index) => [item.key, { label: item.name, color: palette[index % palette.length] }]),
  ) satisfies ChartConfig;
  return (
    <ChartPanel title="Aperturas por organismo" hint="Veces que abrieron el enlace cada día, de cualquier sector, en los últimos 14 días.">
      {series.length === 0 ? (
        <p className="text-small text-ink-secondary">Nadie abrió un enlace en 14 días.</p>
      ) : (
        <>
          <Legend series={series} />
          <ChartContainer config={config} className="aspect-auto h-72 w-full min-w-0">
            <BarChart data={bars} margin={{ left: 0, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="dia" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={18} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent omitZero />} />
              {series.map((item) => (
                <Bar key={item.key} dataKey={item.key} stackId="opens" fill={`var(--color-${item.key})`} radius={4} />
              ))}
            </BarChart>
          </ChartContainer>
        </>
      )}
    </ChartPanel>
  );
}

function Legend({ series }: { series: OrgOpenSeries[] }) {
  return (
    <div className="mb-4 flex flex-wrap gap-4 text-small text-ink-secondary">
      {series.map((item, index) => (
        <span key={item.key} className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-sm" style={{ background: palette[index % palette.length] }} />
          {item.name} · {item.total.toLocaleString("es-MX")}
        </span>
      ))}
    </div>
  );
}

