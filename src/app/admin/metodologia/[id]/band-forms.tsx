import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function BandForms({
  action,
  bands,
}: {
  action: string;
  bands: { level: string; min_score: number; max_score: number; riesgo: string; reto: string }[];
}) {
  return (
    <>
      {bands.map((band) => (
        <FormSheet key={band.level} action="Editar" resource={`banda ${band.level}`}>
          <form action={action} method="post" className="grid gap-3">
            <input type="hidden" name="accion" value="banda" />
            <input type="hidden" name="tab" value="bandas" />
            <input type="hidden" name="level" value={band.level} />
            <label className="grid gap-1 text-small">
              Mínimo
              <input name="min_score" type="number" defaultValue={band.min_score} className="rounded-lg border border-line px-3 py-2" />
            </label>
            <label className="grid gap-1 text-small">
              Máximo
              <input name="max_score" type="number" defaultValue={band.max_score} className="rounded-lg border border-line px-3 py-2" />
            </label>
            <label className="grid gap-1 text-small">
              Riesgo
              <input name="riesgo" defaultValue={band.riesgo} className="rounded-lg border border-line px-3 py-2" />
            </label>
            <label className="grid gap-1 text-small">
              Reto
              <input name="reto" defaultValue={band.reto} className="rounded-lg border border-line px-3 py-2" />
            </label>
            <SheetSubmit>Guardar banda</SheetSubmit>
          </form>
        </FormSheet>
      ))}
    </>
  );
}
