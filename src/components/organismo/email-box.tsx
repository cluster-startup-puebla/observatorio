import { Field, controlClass } from "@/components/landing/molecules/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadEmailsAction } from "@/lib/organismo-actions";

export function EmailBox({ error }: { error?: string }) {
  return (
    <form action={uploadEmailsAction} className="grid gap-5">
      <Field id="correos" label="Correos, uno por línea">
        <textarea id="correos" name="correos" rows={6} className={controlClass} />
      </Field>
      {error === "correos" ? (
        <Alert variant="destructive">
          <AlertDescription>Ningún correo válido.</AlertDescription>
        </Alert>
      ) : null}
      <button type="submit" className="btn btn-primary">
        Cargar correos
      </button>
    </form>
  );
}
