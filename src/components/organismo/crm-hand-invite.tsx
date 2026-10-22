import { Field, controlClass } from "@/components/landing/molecules/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createHandInviteAction } from "@/lib/organismo/hand-invite-action";

const notices: Record<string, string> = {
  invitacion: "Escribe nombre, empresa y un correo válido.",
  repetido: "Ese correo ya está en el CRM.",
};

export function CrmHandInvite({ slug, error }: { slug: string; error?: string }) {
  const notice = error ? notices[error] : "";
  return (
    <form action={createHandInviteAction} className="grid gap-3 rounded-xl border border-line bg-elevated p-4">
      <div className="grid gap-1">
        <p className="text-small font-semibold text-ink">Llamada a la empresa</p>
        <p className="text-small text-ink-secondary">Anota lo que te dijeron. Queda pendiente.</p>
      </div>
      {notice ? (
        <Alert variant="destructive">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}
      <input type="hidden" name="slug" value={slug} />
      <Field id="crm-nombre" label="Nombre">
        <input id="crm-nombre" name="nombre" required className={controlClass} />
      </Field>
      <Field id="crm-empresa" label="Empresa">
        <input id="crm-empresa" name="empresa" required className={controlClass} />
      </Field>
      <Field id="crm-correo" label="Correo">
        <input id="crm-correo" name="correo" type="email" required autoComplete="email" className={controlClass} />
      </Field>
      <button type="submit" className="btn btn-primary">
        Crear invitación
      </button>
    </form>
  );
}
