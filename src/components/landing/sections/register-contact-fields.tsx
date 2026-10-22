import { controlClass, Field } from "@/components/landing/molecules/field";
import { SourceCombobox } from "@/components/landing/molecules/source-combobox";
import { companySizes } from "@/content/landing";
import type { Errors, FormState } from "@/components/landing/sections/register-form-model";

export function RegisterContactFields({
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
      <fieldset className="grid gap-2">
        <legend className="text-small font-semibold text-ink">Número de empleados</legend>
        <div className="flex flex-wrap gap-2">
          {companySizes.map((size) => (
            <label key={size} className="text-small">
              <input
                type="radio"
                name="empleados"
                value={size}
                checked={values.size === size}
                onChange={() => update("size", size)}
                className="peer sr-only"
              />
              <span className="inline-flex cursor-pointer rounded-full border border-line px-4 py-2 peer-checked:border-brand peer-checked:text-mark">
                {size}
              </span>
            </label>
          ))}
        </div>
        {errors.size ? <p className="text-small text-mark">{errors.size}</p> : null}
      </fieldset>
      <Field id="correo" label="Correo" error={errors.email}>
        <input
          id="correo"
          name="correo"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          className={controlClass}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "correo-error" : undefined}
        />
      </Field>
      <Field id="whatsapp" label="WhatsApp" error={errors.whatsapp}>
        <input
          id="whatsapp"
          name="whatsapp"
          type="tel"
          autoComplete="tel"
          value={values.whatsapp}
          onChange={(event) => update("whatsapp", event.target.value)}
          className={controlClass}
          aria-invalid={Boolean(errors.whatsapp)}
          aria-describedby={errors.whatsapp ? "whatsapp-error" : undefined}
        />
      </Field>
      <Field id="fuente" label="¿Cómo te enteraste?" error={errors.source}>
        <SourceCombobox value={values.source} onChange={(source) => update("source", source)} error={errors.source} />
      </Field>
    </>
  );
}
