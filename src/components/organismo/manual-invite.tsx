import { Field, controlClass } from "@/components/landing/molecules/field";
import { createInviteAction } from "@/lib/organismo-actions";

export function ManualInvite() {
  return (
    <form action={createInviteAction} className="grid gap-5">
      <Field id="nombre" label="Nombre">
        <input id="nombre" name="nombre" className={controlClass} />
      </Field>
      <Field id="empresa" label="Empresa">
        <input id="empresa" name="empresa" className={controlClass} />
      </Field>
      <Field id="correo-invitado" label="Correo del invitado">
        <input id="correo-invitado" name="correo" type="email" autoComplete="email" className={controlClass} />
      </Field>
      <button type="submit" className="btn btn-primary">
        Crear invitación
      </button>
    </form>
  );
}
