import { ConfidentialityNote } from "@/components/onboarding/confidentiality-note";
import { Field, controlClass } from "@/components/landing/molecules/field";
import { completeEmpresarioAction, completeOrganismoAction } from "@/lib/account-actions";

const sizes = ["1–10", "11–50", "51–250"];

export function OnboardingWizard({
  accountId,
  role,
  sectorSlug,
  sectorName,
  onboarded,
  missingSize,
}: {
  accountId: string;
  role: string;
  sectorSlug: string | null;
  sectorName: string | null;
  onboarded: boolean;
  missingSize?: boolean;
}) {
  const organismo = role === "director";

  if (onboarded && !organismo) {
    return (
      <div className="grid gap-4">
        <ConfidentialityNote />
        <p data-testid="qr-listo" className="text-h3 text-ink">
          Tu pase quedó listo.
        </p>
      </div>
    );
  }

  if (organismo) {
    return (
      <form action={completeOrganismoAction} className="grid gap-5">
        <ConfidentialityNote />
        <input type="hidden" name="accountId" value={accountId} />
        <Field id="nombre-organismo" label="Nombre del organismo">
          <input id="nombre-organismo" name="nombre" className={controlClass} />
        </Field>
        <Field id="color" label="Color">
          <input id="color" name="color" className={controlClass} />
        </Field>
        <Field id="logo" label="Logo">
          <input id="logo" name="logo" type="file" accept="image/png,image/jpeg" className={controlClass} />
        </Field>
        <button type="button" className="btn btn-secondary" disabled>
          Copiar enlace del evento
        </button>
        <button type="submit" className="btn btn-primary">
          Terminar perfil
        </button>
      </form>
    );
  }

  return (
    <form action={completeEmpresarioAction} className="grid gap-5">
      <ConfidentialityNote />
      {sectorName ? (
        <p data-testid="sector-elegido" className="text-h3 text-ink">
          {sectorName}
        </p>
      ) : null}
      <input type="hidden" name="accountId" value={accountId} />
      <input type="hidden" name="sector" value={sectorSlug ?? ""} />
      <fieldset className="grid gap-3">
        <legend className="text-small font-semibold text-ink">Personas en la empresa</legend>
        {sizes.map((size) => (
          <label key={size} className="flex items-center gap-3 text-body text-ink">
            <input type="radio" name="size" value={size} />
            {size}
          </label>
        ))}
      </fieldset>
      {missingSize ? (
        <p className="text-small text-mark">Elige el tamaño de tu empresa para terminar.</p>
      ) : null}
      <button type="submit" className="btn btn-primary">
        Terminar perfil
      </button>
    </form>
  );
}
