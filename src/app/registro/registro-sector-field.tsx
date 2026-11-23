import { IndustryCombobox } from "@/components/industria/industry-combobox";
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

  return <IndustryCombobox value={value} onChange={onChange} />;
}
