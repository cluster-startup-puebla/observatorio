"use client";

import { PendingSubmit } from "@/components/auth/pending-submit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RegistroCloseFields } from "./registro-close-fields";
import { RegistroCompanyFields } from "./registro-company-fields";
import { RegistroPersonFields } from "./registro-person-fields";
import { RegistroSectorField } from "./registro-sector-field";
import { useRegistroSubmit } from "./use-registro-submit";

export function RegistroForm({ sector, invitacion }: { sector?: string; invitacion?: string }) {
  const form = useRegistroSubmit(sector ?? "", invitacion ?? "");

  if (form.done) return <p className="text-body text-ink">Quedó registrado</p>;

  return (
    <form className="grid gap-5" action={form.submit}>
      <RegistroPersonFields values={form.values} onChange={form.patch} />
      <RegistroCompanyFields values={form.values} onChange={form.patch} />
      <RegistroSectorField
        sector={sector}
        value={form.values.sectorSlug}
        onChange={(sectorSlug) => form.patch({ sectorSlug })}
      />
      <RegistroCloseFields
        referralSource={form.values.referralSource}
        sessionInterest={form.values.sessionInterest}
        terms={form.terms}
        onChange={form.patch}
        onTerms={form.acceptTerms}
      />
      {form.error ? (
        <Alert variant="destructive">
          <AlertDescription>{form.error}</AlertDescription>
        </Alert>
      ) : null}
      <PendingSubmit idle="Registrarme" pendingLabel="Registrando…" forcePending={form.pending} />
    </form>
  );
}
