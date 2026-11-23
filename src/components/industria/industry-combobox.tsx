"use client";

import { FilterCombobox } from "@/components/onboarding/filter-combobox";
import { sectors } from "@/lib/sectors";

const options = sectors.map((sector) => ({ value: sector.slug, label: sector.name }));

export function IndustryCombobox({
  id = "sector",
  name = "sector",
  label = "Industria",
  value,
  allowCustom = true,
  placeholder = "Escribe o elige",
  onChange,
}: {
  id?: string;
  name?: string;
  label?: string;
  value: string;
  allowCustom?: boolean;
  placeholder?: string;
  onChange: (sectorSlug: string) => void;
}) {
  return (
    <FilterCombobox
      id={id}
      name={name}
      label={label}
      value={value}
      allowCustom={allowCustom}
      placeholder={placeholder}
      options={options}
      onChange={onChange}
    />
  );
}
