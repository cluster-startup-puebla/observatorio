"use client";

import { AutoSubmit } from "@/components/auto-submit";
import { FileDrop } from "@/components/file-drop";
import { InviteNotice } from "@/components/organismo/invite-notice";
import { uploadInvitesAction } from "@/lib/organismo-actions";

export function InviteUpload({ slug, error }: { slug: string; error?: string }) {
  return (
    <form action={uploadInvitesAction} className="grid gap-3">
      <input type="hidden" name="slug" value={slug} />
      <InviteNotice error={error} />
      <FileDrop
        id="archivo-invitaciones"
        name="archivo"
        label="Archivo de invitaciones"
        accept=".csv,text/csv"
        hint="CSV con nombre, empresa y correo"
        tracked
      />
      <AutoSubmit selector="[data-invite-file]" readyTestId="carga-lista" />
    </form>
  );
}
