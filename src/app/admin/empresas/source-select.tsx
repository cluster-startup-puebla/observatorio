import { sectorSources } from "@/lib/admin/empresas/sector-source";

export function SourceSelect({ value }: { value?: string }) {
  return (
    <select name="sector_source" defaultValue={value ?? "chosen"} className="rounded-lg border border-line px-3 py-2">
      {sectorSources.map((source) => (
        <option key={source.value} value={source.value}>
          {source.label}
        </option>
      ))}
    </select>
  );
}
