import { sessionTimeZones } from "@/lib/sessions/face";

export function SessionZoneField({ value }: { value?: string }) {
  const known = sessionTimeZones.find((zone) => zone === value);
  return (
    <label className="grid gap-1 text-small">
      Zona horaria
      <select
        name="time_zone"
        defaultValue={known ?? "America/Mexico_City"}
        className="rounded-lg border border-line px-3 py-2"
      >
        {sessionTimeZones.map((zone) => (
          <option key={zone} value={zone}>
            {zone}
          </option>
        ))}
      </select>
    </label>
  );
}
