import { controlClass, Field } from "@/components/landing/molecules/field";
import { CompanyLogoFields } from "@/components/onboarding/company-logo-fields";
import { EmpresarioCompanyFacts } from "@/components/onboarding/empresario-company-facts";

export type CompanyStepValues = {
  companyName: string;
  website?: string;
  marketSize: string;
  employeeBand: string;
  municipality: string;
  sectorSlug: string;
  showLogo: boolean;
  hasLogo: boolean;
};

export function EmpresarioStepCompany({
  values,
  onChange,
}: {
  values: CompanyStepValues;
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
      <Field id="website" label="Sitio web">
        <input
          id="website"
          name="website"
          required
          maxLength={200}
          inputMode="url"
          autoComplete="url"
          placeholder="ejemplo.com"
          className={controlClass}
          value={values.website ?? ""}
          onChange={(event) => onChange({ website: event.target.value })}
        />
      </Field>
      <CompanyLogoFields
        showLogo={values.showLogo}
        onShow={(showLogo) => onChange({ showLogo })}
        onFile={(hasLogo) => onChange({ hasLogo })}
        deferrable
      />
      <EmpresarioCompanyFacts values={values} onChange={onChange} />
    </div>
  );
}
