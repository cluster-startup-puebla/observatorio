import { FilterCombobox } from "@/components/onboarding/filter-combobox";
import { OnboardingSelect } from "@/components/onboarding/onboarding-select";
import { companySizes } from "@/content/landing";
import { marketSizes } from "@/lib/onboarding/market-sizes";
import { pueblaMunicipios } from "@/lib/onboarding/puebla-municipios";
import { IndustryCombobox } from "@/components/industria/industry-combobox";

type CompanyFacts = {
  marketSize: string;
  employeeBand: string;
  municipality: string;
  sectorSlug: string;
};

export function EmpresarioCompanyFacts({
  values,
  onChange,
}: {
  values: CompanyFacts;
  onChange: (patch: Partial<CompanyFacts>) => void;
}) {
  return (
    <>
      <OnboardingSelect
        id="marketSize"
        label="Tamaño de mercado"
        value={values.marketSize}
        onChange={(marketSize) => onChange({ marketSize })}
        options={marketSizes.map((item) => ({ value: item.value, label: item.label }))}
      />
      <OnboardingSelect
        id="employeeBand"
        label="Número de empleados"
        value={values.employeeBand}
        onChange={(employeeBand) => onChange({ employeeBand })}
        options={companySizes.map((size) => ({ value: size, label: size }))}
      />
      <FilterCombobox
        id="municipality"
        name="municipality"
        label="Municipio de Puebla"
        value={values.municipality}
        placeholder="Busca tu municipio"
        options={pueblaMunicipios.map((name) => ({ value: name, label: name }))}
        onChange={(municipality) => onChange({ municipality })}
      />
      <IndustryCombobox
        value={values.sectorSlug}
        onChange={(sectorSlug) => onChange({ sectorSlug })}
      />
    </>
  );
}
