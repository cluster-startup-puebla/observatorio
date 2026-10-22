export const marketSizes = [
  { value: "local", label: "Local (municipio / zona metropolitana)" },
  { value: "regional", label: "Regional (estado o vecinos)" },
  { value: "nacional", label: "Nacional" },
  { value: "exportacion", label: "Exportación" },
] as const;

export type MarketSize = (typeof marketSizes)[number]["value"];

export function parseMarketSize(value: string): MarketSize | null {
  return marketSizes.find((item) => item.value === value)?.value ?? null;
}
