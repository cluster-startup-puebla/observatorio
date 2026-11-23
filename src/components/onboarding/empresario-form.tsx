"use client";

import { useState } from "react";
import { ConfidentialityNote } from "@/components/onboarding/confidentiality-note";
import { EmpresarioFormNav } from "@/components/onboarding/empresario-form-nav";
import { TermsAccept } from "@/components/onboarding/terms-accept";
import { EmpresarioStepCompany } from "@/components/onboarding/empresario-step-company";
import { EmpresarioStepPerson } from "@/components/onboarding/empresario-step-person";
import { EmpresarioStepReferral } from "@/components/onboarding/empresario-step-referral";
import { useEmpresarioDraft } from "@/components/onboarding/use-empresario-draft";
import { completeEmpresarioAction } from "@/lib/onboarding/complete-empresario";
import { serverIssue, stepIssue } from "@/lib/onboarding/step-issue";

const titles = ["Tú", "Tu empresa", "La sesión"];

export function EmpresarioForm({
  accountId,
  sectorSlug,
  invitacion,
  error,
}: {
  accountId: string;
  sectorSlug: string | null;
  invitacion?: string;
  error?: string;
}) {
  const [step, setStep] = useState(0);
  const [terms, setTerms] = useState(false);
  const [issue, setIssue] = useState("");
  const [values, setValues] = useEmpresarioDraft(accountId, sectorSlug);
  const notice = issue || serverIssue(error);

  function patch(next: Partial<typeof values>) {
    setIssue("");
    setValues((current) => ({ ...current, ...next }));
  }

  function nextStep() {
    const clearShow = step === 1 && values.showLogo && !values.hasLogo;
    const ready = clearShow ? { ...values, showLogo: false } : values;
    if (clearShow) patch({ showLogo: false });
    const next = stepIssue(step, ready);
    if (next) {
      setIssue(next);
      return;
    }
    setIssue("");
    setStep((current) => current + 1);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (terms) return;
    event.preventDefault();
    setIssue(serverIssue("terminos"));
  }

  return (
    <form action={completeEmpresarioAction} onSubmit={onSubmit} className="grid gap-5">
      <ConfidentialityNote />
      <p className="text-small font-semibold text-ink">
        Paso {step + 1} de 3 · {titles[step]}
      </p>
      <input type="hidden" name="accountId" value={accountId} />
      <input type="hidden" name="invitacion" value={invitacion ?? ""} />
      <div className={step === 0 ? "grid gap-4" : "hidden"}>
        <EmpresarioStepPerson values={values} onChange={patch} />
      </div>
      <div className={step === 1 ? "grid gap-4" : "hidden"}>
        <EmpresarioStepCompany values={values} onChange={patch} />
      </div>
      <div className={step === 2 ? "grid gap-4" : "hidden"}>
        <EmpresarioStepReferral values={values} onChange={patch} />
        <TermsAccept checked={terms} onChange={setTerms} />
      </div>
      {notice ? <p className="text-small text-mark">{notice}</p> : null}
      <EmpresarioFormNav step={step} onBack={() => setStep((s) => s - 1)} onNext={nextStep} />
    </form>
  );
}
