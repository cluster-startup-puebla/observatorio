"use client";

import { cn } from "cn";
import { Tooltip } from "recharts";
import { useChart } from "@/components/ui/chart-context";

export const ChartTooltip = Tooltip;

type TipItem = {
  name?: string | number;
  value?: number | string | ReadonlyArray<number | string>;
  dataKey?: string | number;
  color?: string;
  payload?: { fill?: string };
  type?: string;
};

function shown(value: TipItem["value"]) {
  if (typeof value === "number") return value.toLocaleString("es-MX");
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(String).join(", ");
  return "";
}

function counts(value: TipItem["value"]) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value !== "") return Number(value);
  return Number.NaN;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  omitZero = false,
}: {
  active?: boolean;
  payload?: ReadonlyArray<TipItem>;
  label?: string | number;
  className?: string;
  omitZero?: boolean;
}) {
  const { config } = useChart();
  const rows = (payload ?? []).filter((item) => item.type !== "none" && (!omitZero || counts(item.value) > 0));
  if (!active || rows.length === 0) return null;
  const title = typeof label === "string" ? (config[label]?.label ?? label) : label;
  return (
    <div className={cn("grid min-w-32 gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl", className)}>
      {title ? <div className="font-medium">{title}</div> : null}
      {rows
        .map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? "value");
          const color = item.payload?.fill ?? item.color ?? `var(--color-${key})`;
          return (
            <div key={index} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2.5 shrink-0 rounded-[2px]" style={{ background: color }} />
                {config[key]?.label ?? item.name ?? key}
              </span>
              <span className="font-medium tabular-nums text-foreground">{shown(item.value)}</span>
            </div>
          );
        })}
    </div>
  );
}
