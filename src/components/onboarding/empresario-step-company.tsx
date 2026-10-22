import { controlClass, Field } from "@/components/landing/molecules/field";
import { OnboardingSelect } from "@/components/onboarding/onboarding-select";
import { companySizes } from "@/content/landing";
import { marketSizes } from "@/lib/onboarding/market-sizes";
import { pueblaMunicipios } from "@/lib/onboarding/puebla-municipios";
import { sectors } from "@/lib/sectors";

export type CompanyStepValues = {
  companyName: string;
  marketSize: string;
  employeeBand: string;
  municipality: string;
  sectorSlug: string;
};

export function EmpresarioStepCompany({
  values,
  sectorLocked,
  onChange,
}: {
  values: CompanyStepValues;
  sectorLocked: boolean;
  onChange: (patch: Partial<CompanyStepValues>) => void;
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
        <p className="text-small text-ink-secondary">
          Este dato es anónimo: solo sirve para tu perfil en la sesión.
        </p>
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
      <OnboardingSelect
        id="municipality"
        label="Municipio de Puebla"
        value={values.municipality}
        onChange={(municipality) => onChange({ municipality })}
        options={pueblaMunicipios.map((name) => ({ value: name, label: name }))}
      />
      <OnboardingSelect
        id="sector"
        label="Industria"
        name={sectorLocked ? null : "sector"}
        value={values.sectorSlug}
        onChange={(sectorSlug) => onChange({ sectorSlug })}
        disabled={sectorLocked}
        options={sectors.map((sector) => ({ value: sector.slug, label: sector.name }))}
      />
      {sectorLocked ? <input type="hidden" name="sector" value={values.sectorSlug} /> : null}
    </div>
  );
}
