const labels: Record<string, string> = {
  "1_10": "1–10",
  "11_50": "11–50",
  "51_250": "51–250",
  "250_plus": "250+",
};

export function bandLabel(value: string) {
  return labels[value] ?? "";
}
