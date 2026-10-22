import { QuotaFields } from "@/app/admin/sesiones/quota-fields";

type Sector = { id: string; name: string; slug: string };

export function SessionFields({
  defaults,
  sectors,
  quotas,
}: {
  defaults?: {
    venue?: string;
    format_name?: string;
    starts_local?: string;
    ends_local?: string;
    capacity_min?: string;
    capacity_max?: string;
    audience?: string;
    includes?: string;
    is_current?: boolean;
  };
  sectors: Sector[];
  quotas?: Record<string, number>;
}) {
  const d = defaults ?? {};
  return (
    <>
      <label className="grid gap-1 text-small">
        Lugar
        <input name="venue" defaultValue={d.venue} required className="rounded-lg border border-line px-3 py-2" />
      </label>
      <label className="grid gap-1 text-small">
        Formato
        <input name="format_name" defaultValue={d.format_name} required className="rounded-lg border border-line px-3 py-2" />
      </label>
      <label className="grid gap-1 text-small">
        Empieza
        <input name="starts_local" type="time" defaultValue={d.starts_local} required className="rounded-lg border border-line px-3 py-2" />
      </label>
      <label className="grid gap-1 text-small">
        Termina
        <input name="ends_local" type="time" defaultValue={d.ends_local} required className="rounded-lg border border-line px-3 py-2" />
      </label>
      <label className="grid gap-1 text-small">
        Cupo mínimo
        <input name="capacity_min" type="number" min={1} defaultValue={d.capacity_min ?? "8"} className="rounded-lg border border-line px-3 py-2" />
      </label>
      <QuotaFields sectors={sectors} quotas={quotas} capacityMax={d.capacity_max} />
      <label className="grid gap-1 text-small">
        Público
        <input name="audience" defaultValue={d.audience} required className="rounded-lg border border-line px-3 py-2" />
      </label>
      <label className="grid gap-1 text-small">
        Incluye
        <input name="includes" defaultValue={d.includes} required className="rounded-lg border border-line px-3 py-2" />
      </label>
      {d.is_current !== undefined ? (
        <label className="flex items-center gap-2 text-small">
          <input name="is_current" type="checkbox" defaultChecked={d.is_current} />
          Vigente
        </label>
      ) : null}
    </>
  );
}
