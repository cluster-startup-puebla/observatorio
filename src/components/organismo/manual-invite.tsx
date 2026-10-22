import { Field, controlClass } from "@/components/landing/molecules/field";
import { InviteNotice } from "@/components/organismo/invite-notice";
import { createInviteAction } from "@/lib/organismo-actions";

export function ManualInvite({ slug, error }: { slug: string; error?: string }) {
  return (
    <form action={createInviteAction} className="grid gap-5">
      <input type="hidden" name="slug" value={slug} />
      <InviteNotice error={error} />
      <Field id="nombre" label="Nombre">
        <input id="nombre" name="nombre" required className={controlClass} />
      </Field>
      <Field id="empresa" label="Empresa">
        <input id="empresa" name="empresa" required className={controlClass} />
      </Field>
      <Field id="correo-invitado" label="Correo del invitado">
        <input id="correo-invitado" name="correo" type="email" required autoComplete="email" className={controlClass} />
      </Field>
      <button type="submit" className="btn btn-primary">
        Crear invitación
      </button>
    </form>
  );
}
