import { sessionKinds, sessionModalities } from "@/lib/admin/sesiones/kinds";

type Option = { id: string; label: string };

export function SessionShapeFields({
  defaults,
  instruments,
}: {
  defaults?: { modality?: string; kind?: string; instrument_id?: string };
  instruments: Option[];
}) {
  const d = defaults ?? {};
  return (
    <>
      <label className="grid gap-1 text-small">
        Tipo
        <select name="modality" defaultValue={d.modality ?? "presencial"} required className="rounded-lg border border-line px-3 py-2">
          {sessionModalities.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-small">
        Plantilla
        <select name="kind" defaultValue={d.kind ?? "foro"} required className="rounded-lg border border-line px-3 py-2">
          {sessionKinds.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-small">
        Instrumento (opcional)
        <select name="instrument_id" defaultValue={d.instrument_id ?? ""} className="rounded-lg border border-line px-3 py-2">
          <option value="">Sin test fijo · por sector</option>
          {instruments.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
