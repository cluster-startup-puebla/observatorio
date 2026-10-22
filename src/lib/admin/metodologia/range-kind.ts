export function rangeKind(value: string) {
  if (value === "high" || value === "low") return value;
  return null;
}
