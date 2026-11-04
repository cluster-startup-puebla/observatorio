import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/auth/password-input";
import { PendingSubmit } from "@/components/auth/pending-submit";
import { Field } from "@/components/landing/molecules/field";
import { changePasswordAction } from "@/lib/auth/change-password-action";

const notices: Record<string, string> = {
  actual: "La contraseña actual no coincide.",
  corta: "Usa al menos 8 caracteres.",
  distinta: "Las contraseñas no coinciden.",
  igual: "Elige una contraseña distinta a la actual.",
  guardar: "No se pudo guardar la contraseña.",
  base: "Esta cuenta de prueba no puede cambiar la contraseña aquí.",
};

export function PasswordForm({ sector, error }: { sector: string; error?: string }) {
  const notice = error ? notices[error] : "";
  return (
    <form action={changePasswordAction} className="grid gap-5">
      {notice ? (
        <Alert variant="destructive">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}
      <input type="hidden" name="sector" value={sector} />
      <Field id="actual" label="Contraseña actual">
        <PasswordInput id="actual" name="actual" label="contraseña actual" autoComplete="current-password" />
      </Field>
      <Field id="nueva" label="Nueva contraseña">
        <PasswordInput id="nueva" name="nueva" label="nueva contraseña" autoComplete="new-password" />
      </Field>
      <Field id="confirmar" label="Confirmar contraseña">
        <PasswordInput id="confirmar" name="confirmar" label="confirmación" autoComplete="new-password" />
      </Field>
      <PendingSubmit idle="Guardar contraseña" pendingLabel="Guardando…" className="btn btn-primary w-fit" />
    </form>
  );
}
