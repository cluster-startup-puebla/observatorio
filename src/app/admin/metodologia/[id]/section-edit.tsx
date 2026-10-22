import { FormSheet } from "@/components/admin/form-sheet";
import { SearchCombobox } from "@/components/admin/search-combobox";
import { SheetSubmit } from "@/components/admin/sheet-submit";

const ranges = [
  { id: "high", label: "Alto" },
  { id: "low", label: "Bajo" },
];

export function SectionEditForm({
  action,
  section,
}: {
  action: string;
  section: { name: string; range_kind: string };
}) {
  return (
    <FormSheet action="Editar" resource="sección">
      <form action={action} method="post" className="grid gap-3">
        <input type="hidden" name="accion" value="seccion" />
        <input type="hidden" name="tab" value="bandas" />
        <label className="grid gap-1 text-small">
          Nombre
          <input name="name" defaultValue={section.name} className="rounded-lg border border-line px-3 py-2" />
        </label>
        <label className="grid gap-1 text-small" htmlFor="detail-range">
          Rango
          <SearchCombobox
            id="detail-range"
            name="range_kind"
            defaultValue={section.range_kind}
            noneLabel="Elige un rango"
            items={ranges}
            listLabel="Rango"
          />
        </label>
        <SheetSubmit>Guardar sección</SheetSubmit>
      </form>
    </FormSheet>
  );
}
