"use client";

import { useState } from "react";
import { SheetSubmit } from "@/components/admin/sheet-submit";
import { ConfidentialityNote } from "@/components/onboarding/confidentiality-note";
import { EmpresarioStepCompany } from "@/components/onboarding/empresario-step-company";
import { EmpresarioStepPerson } from "@/components/onboarding/empresario-step-person";
import { EmpresarioStepReferral } from "@/components/onboarding/empresario-step-referral";
import { completeEmpresarioAction } from "@/lib/onboarding/complete-empresario";
import { emptyEmpresarioValues, stepReady } from "@/lib/onboarding/empresario-steps";

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
  const [stepError, setStepError] = useState(false);
  const [values, setValues] = useState(() => emptyEmpresarioValues(sectorSlug ?? ""));

  function patch(next: Partial<typeof values>) {
    setValues((current) => ({ ...current, ...next }));
  }

  function nextStep() {
    if (!stepReady(step, values)) {
      setStepError(true);
      return;
    }
    setStepError(false);
    setStep((current) => current + 1);
  }

  return (
    <form action={completeEmpresarioAction} className="grid gap-5">
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
      </div>
      {stepError || error ? (
        <p className="text-small text-mark">Completa este paso para continuar.</p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {step > 0 ? (
          <button type="button" className="btn btn-secondary" onClick={() => setStep((s) => s - 1)}>
            Atrás
          </button>
        ) : null}
        {step < 2 ? (
          <button type="button" className="btn btn-primary" onClick={nextStep}>
            Continuar
          </button>
        ) : (
          <SheetSubmit pendingLabel="Terminando…">Terminar perfil</SheetSubmit>
        )}
      </div>
    </form>
  );
}
