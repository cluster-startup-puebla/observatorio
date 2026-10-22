"use client";

import * as React from "react";
import { cn } from "cn";
import { ResponsiveContainer } from "recharts";
import { ChartProvider, type ChartConfig } from "@/components/ui/chart-context";

const frame =
  "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-surface]:outline-hidden";

export function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;
  return (
    <ChartProvider config={config}>
      <div data-slot="chart" data-chart={chartId} className={cn(frame, className)} {...props}>
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer initialDimension={{ width: 320, height: 200 }}>{children}</ResponsiveContainer>
      </div>
    </ChartProvider>
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const lines = Object.entries(config)
    .filter(([, item]) => item.color)
    .map(([key, item]) => `  --color-${key}: ${item.color};`)
    .join("\n");
  if (!lines) return null;
  return <style dangerouslySetInnerHTML={{ __html: `[data-chart="${id}"] {\n${lines}\n}` }} />;
}
