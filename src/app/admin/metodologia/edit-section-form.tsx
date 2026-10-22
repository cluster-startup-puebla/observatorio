"use client";

import { FormSheet } from "@/components/admin/form-sheet";
import { SearchCombobox } from "@/components/admin/search-combobox";
import { SheetSubmit } from "@/components/admin/sheet-submit";

const ranges = [
  { id: "high", label: "Alto" },
  { id: "low", label: "Bajo" },
];

export function EditSectionForm({
  id,
  name,
  rangeKind,
  open,
  trigger,
}: {
  id: string;
  name: string;
  rangeKind: string;
  open?: boolean;
  trigger?: React.ReactNode;
}) {
  return (
    <FormSheet action="Editar" resource="sección" open={open} trigger={trigger}>
      <form action={`/api/admin/metodologia/${id}`} method="post" className="grid gap-3">
        <input type="hidden" name="accion" value="seccion" />
        <input type="hidden" name="tab" value="bandas" />
        <input type="hidden" name="return_to" value="list" />
        <label className="grid gap-1 text-small" htmlFor={`section-name-${id}`}>
          Nombre
          <input id={`section-name-${id}`} name="name" defaultValue={name} required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small" htmlFor={`section-range-${id}`}>
          Rango
          <SearchCombobox
            id={`section-range-${id}`}
            name="range_kind"
            defaultValue={rangeKind}
            noneLabel="Elige un rango"
            searchPlaceholder="Buscar rango"
            listLabel="Rango"
            items={ranges}
          />
        </label>
        <SheetSubmit>Guardar sección</SheetSubmit>
      </form>
    </FormSheet>
  );
}
