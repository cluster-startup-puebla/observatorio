import { controlClass, Field } from "@/components/landing/molecules/field";
import { FilterCombobox } from "@/components/onboarding/filter-combobox";
import { OnboardingSelect } from "@/components/onboarding/onboarding-select";
import { companySizes } from "@/content/landing";
import { marketSizes } from "@/lib/onboarding/market-sizes";
import { pueblaMunicipios } from "@/lib/onboarding/puebla-municipios";

type CompanyValues = {
  companyName: string;
  marketSize: string;
  employeeBand: string;
  municipality: string;
};

export function RegistroStepCompany({
  values,
  onChange,
}: {
  values: CompanyValues;
  onChange: (patch: Partial<CompanyValues>) => void;
}) {
  return (
    <div className="grid gap-4">
      <Field id="companyName" label="Nombre de la empresa">
        <input
          id="companyName"
          name="companyName"
          required
          minLength={2}
          className={controlClass}
          value={values.companyName}
          onChange={(event) => onChange({ companyName: event.target.value })}
        />
      </Field>
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
    </div>
  );
}
