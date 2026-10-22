import { controlClass, Field } from "@/components/landing/molecules/field";
import type { Errors, FormState } from "@/components/landing/sections/register-form-model";

export function RegisterPersonFields({
  values,
  errors,
  update,
}: {
  values: FormState;
  errors: Errors;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <>
      <Field id="nombre" label="Nombre" error={errors.name}>
        <input
          id="nombre"
          name="nombre"
          autoComplete="name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          className={controlClass}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "nombre-error" : undefined}
        />
      </Field>
      <Field id="cargo" label="Cargo" error={errors.role}>
        <input
          id="cargo"
          name="cargo"
          value={values.role}
          onChange={(event) => update("role", event.target.value)}
          className={controlClass}
          aria-invalid={Boolean(errors.role)}
          aria-describedby={errors.role ? "cargo-error" : undefined}
        />
      </Field>
      <Field id="empresa" label="Empresa (confidencial)" error={errors.company}>
        <input
          id="empresa"
          name="empresa"
          value={values.company}
          onChange={(event) => update("company", event.target.value)}
          className={controlClass}
          aria-invalid={Boolean(errors.company)}
          aria-describedby={errors.company ? "empresa-error" : undefined}
        />
      </Field>
      <Field id="sector" label="Sector o actividad principal" error={errors.sector}>
        <input
          id="sector"
          name="sector"
          value={values.sector}
          onChange={(event) => update("sector", event.target.value)}
          className={controlClass}
          aria-invalid={Boolean(errors.sector)}
          aria-describedby={errors.sector ? "sector-error" : undefined}
        />
      </Field>
    </>
  );
}
