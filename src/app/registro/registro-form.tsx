"use client";

import { PendingSubmit } from "@/components/auth/pending-submit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { sectors } from "@/lib/sectors";
import { RegistroStepClose } from "./registro-step-close";
import { RegistroStepCompany } from "./registro-step-company";
import { RegistroStepPerson } from "./registro-step-person";
import { useRegistroForm } from "./use-registro-form";

export function RegistroForm({ sector, invitacion }: { sector?: string; invitacion?: string }) {
  const form = useRegistroForm(sector ?? "", invitacion ?? "");
  const sectorName = sectors.find((item) => item.slug === sector)?.name ?? sector;

  if (form.done) return <p className="text-body text-ink">Quedó registrado</p>;

  return (
    <form className="grid gap-5" action={form.submit}>
      <p className="text-small font-semibold text-ink">Paso {form.step + 1} de 2</p>
      <input type="hidden" name="sector" value={sector ?? ""} />
      {sectorName ? <p className="text-body text-ink">{sectorName}</p> : null}
      {form.step === 0 ? (
        <RegistroStepPerson values={form.values} onChange={form.patch} />
      ) : (
        <>
          <RegistroStepCompany values={form.values} onChange={form.patch} />
          <RegistroStepClose
            referralSource={form.values.referralSource}
            sessionInterest={form.values.sessionInterest}
            terms={form.terms}
            onChange={form.patch}
            onTerms={form.setTerms}
          />
        </>
      )}
      {form.error ? (
        <Alert variant="destructive">
          <AlertDescription>{form.error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {form.step === 1 ? (
          <button type="button" className="btn btn-secondary" onClick={form.back} disabled={form.pending}>
            Atrás
          </button>
        ) : null}
        <PendingSubmit
          idle={form.step === 0 ? "Siguiente" : "Enviar"}
          pendingLabel={form.step === 0 ? "Guardando…" : "Enviando…"}
          forcePending={form.pending}
        />
      </div>
    </form>
  );
}
