"use client";

import { useRef } from "react";
import { ContentImages } from "@/app/admin/sectores/content-images";
import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function SectorPageForm({
  id,
  name,
  headline,
  body,
  images,
  open,
  trigger,
}: {
  id: string;
  name: string;
  headline: string;
  body: string;
  images: { id: string }[];
  open?: boolean;
  trigger?: React.ReactNode;
}) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  return (
    <FormSheet action="Editar" resource="página" open={open} trigger={trigger} label={trigger ? undefined : `Página · ${name}`}>
      <form action={`/api/admin/sectores/${id}`} method="post" className="grid gap-3">
        <input type="hidden" name="accion" value="pagina" />
        <label className="grid gap-1 text-small" htmlFor={`headline-${id}`}>
          Titular
          <input id={`headline-${id}`} name="headline" defaultValue={headline} className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small" htmlFor={`body-${id}`}>
          Cuerpo
          <textarea
            ref={bodyRef}
            id={`body-${id}`}
            name="body"
            defaultValue={body}
            rows={5}
            className="rounded-lg border border-line px-3 py-2"
          />
        </label>
        <ContentImages images={images} onInsert={(imageId) => insertContentImage(bodyRef.current, imageId)} />
        <SheetSubmit>Guardar página</SheetSubmit>
      </form>
    </FormSheet>
  );
}

function insertContentImage(field: HTMLTextAreaElement | null, imageId: string) {
  if (!field) return;
  const tag = `<img src="/api/medios/${imageId}" alt="">`;
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? start;
  field.value = `${field.value.slice(0, start)}${tag}${field.value.slice(end)}`;
  const cursor = start + tag.length;
  field.setSelectionRange(cursor, cursor);
  field.focus();
}
