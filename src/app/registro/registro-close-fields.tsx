"use client";

import { controlClass, Field } from "@/components/landing/molecules/field";
import { SourceCombobox } from "@/components/landing/molecules/source-combobox";
import { TermsAccept } from "@/components/onboarding/terms-accept";

export function RegistroCloseFields({
  referralSource,
  sessionInterest,
  terms,
  onChange,
  onTerms,
}: {
  referralSource: string;
  sessionInterest: string;
  terms: boolean;
  onChange: (patch: { referralSource?: string; sessionInterest?: string }) => void;
  onTerms: (terms: boolean) => void;
}) {
  return (
    <div className="grid min-w-0 gap-4">
      <div className="grid gap-2">
        <p className="text-small font-semibold text-ink">Cómo te enteraste</p>
        <SourceCombobox
          compact
          value={referralSource}
          onChange={(next) => onChange({ referralSource: next })}
        />
      </div>
      <Field id="sessionInterest" label="Qué te interesa">
        <textarea
          id="sessionInterest"
          name="sessionInterest"
          required
          minLength={2}
          maxLength={500}
          rows={4}
          className={controlClass}
          value={sessionInterest}
          onChange={(event) => onChange({ sessionInterest: event.target.value })}
        />
      </Field>
      <TermsAccept checked={terms} onChange={onTerms} />
    </div>
  );
}
