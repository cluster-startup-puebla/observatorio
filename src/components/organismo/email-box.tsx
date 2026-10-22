import { Field, controlClass } from "@/components/landing/molecules/field";
import { InviteNotice } from "@/components/organismo/invite-notice";
import { uploadEmailsAction } from "@/lib/organismo-actions";

export function EmailBox({ slug, error }: { slug: string; error?: string }) {
  return (
    <form action={uploadEmailsAction} className="grid gap-5">
      <input type="hidden" name="slug" value={slug} />
      <Field id="correos" label="Correos, uno por línea">
        <textarea id="correos" name="correos" rows={6} className={controlClass} />
      </Field>
      <InviteNotice error={error} />
      <button type="submit" className="btn btn-primary">
        Cargar correos
      </button>
    </form>
  );
}
