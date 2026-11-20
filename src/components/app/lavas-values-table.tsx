import type { LavaCatalogRow } from "@/lib/lavas/load-catalog";

export function LavasValuesTable({
  catalog,
  multiplier,
  flatBonus,
}: {
  catalog: LavaCatalogRow[];
  multiplier: number;
  flatBonus: number;
}) {
  if (catalog.length === 0) {
    return <p className="text-small text-ink-secondary">Aún no hay acciones publicadas.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-left text-small">
        <thead>
          <tr className="border-b border-line text-ink-secondary">
            <th className="py-2 pr-3 font-medium">Acción</th>
            <th className="py-2 pr-3 font-medium">Lavas</th>
            <th className="py-2 pr-3 font-medium">Condición</th>
            <th className="py-2 pr-3 font-medium">Una vez / repetible</th>
            <th className="py-2 pr-3 font-medium">Multiplicador EIA</th>
            <th className="py-2 font-medium">Bono EIA</th>
          </tr>
        </thead>
        <tbody>
          {catalog.map((row) => (
            <tr key={row.code} className="border-b border-line/70 text-ink">
              <td className="py-2 pr-3">{row.label}</td>
              <td className="py-2 pr-3">{row.base_value}</td>
              <td className="py-2 pr-3">{row.condition_label}</td>
              <td className="py-2 pr-3">{row.repeatable_label}</td>
              <td className="py-2 pr-3">{row.eia_boost ? `×${multiplier}` : "—"}</td>
              <td className="py-2">{row.eia_boost ? `+${flatBonus}` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
