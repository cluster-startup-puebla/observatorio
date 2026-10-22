"use client";

import * as React from "react";

export type ChartConfig = Record<string, { label?: React.ReactNode; color?: string }>;

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

export function ChartProvider({ config, children }: { config: ChartConfig; children: React.ReactNode }) {
  return <ChartContext.Provider value={{ config }}>{children}</ChartContext.Provider>;
}

export function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within a ChartContainer");
  return context;
}
