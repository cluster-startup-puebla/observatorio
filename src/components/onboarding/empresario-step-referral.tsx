"use client";

import { controlClass, Field } from "@/components/landing/molecules/field";
import { SourceCombobox } from "@/components/landing/molecules/source-combobox";

export function EmpresarioStepReferral({
  values,
  onChange,
}: {
  values: { referralSource: string; sessionInterest: string };
  onChange: (patch: Partial<typeof values>) => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <p className="text-small font-semibold text-ink">¿Cómo te enteraste?</p>
        <SourceCombobox
          compact
          value={values.referralSource}
          onChange={(referralSource) => onChange({ referralSource })}
        />
        <input type="hidden" name="referralSource" value={values.referralSource} required />
      </div>
      <Field id="sessionInterest" label="¿Qué te interesa de esta sesión?">
        <textarea
          id="sessionInterest"
          name="sessionInterest"
          required
          minLength={2}
          maxLength={500}
          rows={4}
          className={controlClass}
          value={values.sessionInterest}
          onChange={(event) => onChange({ sessionInterest: event.target.value })}
        />
        <p className="text-small text-ink-secondary">Máximo 500 caracteres.</p>
      </Field>
    </div>
  );
}
