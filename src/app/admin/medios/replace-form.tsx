"use client";

import { FileDrop } from "@/components/file-drop";
import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function ReplaceMedioForm({
  id,
  purpose,
  open,
  trigger,
}: {
  id: string;
  purpose: string;
  open?: boolean;
  trigger?: React.ReactNode;
}) {
  return (
    <FormSheet action="Reemplazar" resource="archivo" open={open} trigger={trigger}>
      <form action={`/api/admin/medios/${id}`} method="post" encType="multipart/form-data" className="grid gap-3">
        <p className="text-small text-ink-muted">{purpose}</p>
        <label className="grid gap-1 text-small">
          Nombre de archivo
          <input name="filename" placeholder="foto.png" className="rounded-lg border border-line px-3 py-2" />
        </label>
        <FileDrop
          id={`medio-${id}`}
          name="archivo"
          label="Archivo"
          accept="image/png,image/jpeg,image/webp"
          hint="PNG, JPG o WebP"
          preview
        />
        <SheetSubmit>Reemplazar archivo</SheetSubmit>
      </form>
    </FormSheet>
  );
}
