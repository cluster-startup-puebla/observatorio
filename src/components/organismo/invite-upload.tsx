"use client";

import { AutoSubmit } from "@/components/auto-submit";
import { uploadInvitesAction } from "@/lib/organismo-actions";

export function InviteUpload() {
  return (
    <form action={uploadInvitesAction} className="grid gap-3">
      <label className="grid gap-2 text-small font-semibold text-ink" htmlFor="archivo-invitaciones">
        Archivo de invitaciones
        <input
          id="archivo-invitaciones"
          name="archivo"
          type="file"
          accept=".csv,text/csv"
          className="font-normal"
          data-invite-file=""
        />
      </label>
      <AutoSubmit selector="[data-invite-file]" readyTestId="carga-lista" />
    </form>
  );
}
