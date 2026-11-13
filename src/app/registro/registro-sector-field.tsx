import { FilterCombobox } from "@/components/onboarding/filter-combobox";
import { sectors } from "@/lib/sectors";

export function RegistroSectorField({
  sector,
  value,
  onChange,
}: {
  sector?: string;
  value: string;
  onChange: (sectorSlug: string) => void;
}) {
  if (sector) {
    const name = sectors.find((item) => item.slug === sector)?.name ?? sector;
    return (
      <div className="grid gap-2">
        <p className="text-small font-semibold text-ink">Industria</p>
        <p className="text-body text-ink">{name}</p>
        <input type="hidden" name="sector" value={sector} />
      </div>
    );
  }

  return (
    <FilterCombobox
      id="sector"
      name="sector"
      label="Industria"
      value={value}
      allowCustom
      placeholder="Escribe o elige"
      options={sectors.map((item) => ({ value: item.slug, label: item.name }))}
      onChange={onChange}
    />
  );
}
