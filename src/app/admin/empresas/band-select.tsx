const bands = [
  { value: "1_10", label: "1–10" },
  { value: "11_50", label: "11–50" },
  { value: "51_250", label: "51–250" },
  { value: "250_plus", label: "250+" },
];

export function BandSelect({ value }: { value?: string }) {
  return (
    <select name="employee_band" defaultValue={value ?? "1_10"} className="rounded-lg border border-line px-3 py-2">
      {bands.map((band) => (
        <option key={band.value} value={band.value}>
          {band.label}
        </option>
      ))}
    </select>
  );
}
