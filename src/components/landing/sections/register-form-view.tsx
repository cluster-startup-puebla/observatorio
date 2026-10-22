import { GovernmentLockup } from "@/components/landing/atoms/government-lockup";
import { Kicker } from "@/components/landing/atoms/kicker";
import { RegisterContactFields } from "@/components/landing/sections/register-contact-fields";
import type { Errors, FormState } from "@/components/landing/sections/register-form-model";
import { RegisterPersonFields } from "@/components/landing/sections/register-person-fields";
import { RegisterPrivacy } from "@/components/landing/sections/register-privacy";
import { ctaLabel } from "@/content/landing";

export function RegisterFormView({
  variant,
  values,
  errors,
  pending,
  downloadDiagnostic,
  onSubmit,
  update,
}: {
  variant: "band" | "page";
  values: FormState;
  errors: Errors;
  pending: boolean;
  downloadDiagnostic: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={variant === "band" ? "grid gap-5 rounded-md bg-surface p-6 text-ink lg:p-8" : "grid gap-5 text-ink"}
    >
      <RegisterPersonFields values={values} errors={errors} update={update} />
      <RegisterContactFields values={values} errors={errors} update={update} />
      <RegisterPrivacy checked={values.privacy} error={errors.privacy} onChange={(privacy) => update("privacy", privacy)} />
      {downloadDiagnostic ? (
        <p className="text-small text-ink-secondary">Al terminar se descarga el diagnóstico integral de VIA Partners.</p>
      ) : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Preparando…" : downloadDiagnostic ? "Registrarme y descargar" : ctaLabel}
      </button>
      <p className="text-small text-ink-muted">Cupo limitado de 15 a 30 empresas por sesión. Sin costo.</p>
      <div className="flex flex-wrap items-center gap-3 text-small text-ink-secondary">
        <Kicker>Con el respaldo de</Kicker>
        <GovernmentLockup />
      </div>
    </form>
  );
}
