import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function OptionForms({
  action,
  options,
}: {
  action: string;
  options: { question_id: number; value: string; label: string }[];
}) {
  return (
    <>
      {options.map((option) => (
        <FormSheet key={`${option.question_id}-${option.value}`} action="Editar" resource="opción">
          <form action={action} method="post" className="grid gap-3">
            <input type="hidden" name="accion" value="opcion" />
            <input type="hidden" name="tab" value="opciones" />
            <input type="hidden" name="question_id" value={option.question_id} />
            <input type="hidden" name="value" value={option.value} />
            <label className="grid gap-1 text-small">
              Etiqueta
              <input name="label" defaultValue={option.label} className="rounded-lg border border-line px-3 py-2" />
            </label>
            <label className="grid gap-1 text-small">
              Puntos
              <input name="points" type="number" className="rounded-lg border border-line px-3 py-2" />
            </label>
            <label className="grid gap-1 text-small">
              Severidad
              <input name="severity" type="number" className="rounded-lg border border-line px-3 py-2" />
            </label>
            <SheetSubmit>Guardar opción</SheetSubmit>
          </form>
        </FormSheet>
      ))}
    </>
  );
}
