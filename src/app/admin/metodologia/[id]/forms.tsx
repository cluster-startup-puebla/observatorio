import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function SectionForms({
  id,
  section,
  questions,
  options,
  bands,
}: {
  id: string;
  section: { name: string; range_kind: string };
  questions: { id: number; prompt: string }[];
  options: { question_id: number; value: string; label: string }[];
  bands: { level: string; min_score: number; max_score: number; riesgo: string; reto: string }[];
}) {
  const action = `/api/admin/metodologia/${id}`;
  return (
    <div className="grid gap-3">
      <FormSheet action="Editar" resource="sección">
        <form action={action} method="post" className="grid gap-2">
          <input type="hidden" name="accion" value="seccion" />
          <input type="hidden" name="tab" value="bandas" />
          <input name="name" defaultValue={section.name} />
          <input name="range_kind" defaultValue={section.range_kind} />
          <SheetSubmit>Guardar sección</SheetSubmit>
        </form>
      </FormSheet>
      {questions.map((question) => (
        <FormSheet key={question.id} action="Editar" resource="pregunta">
          <form action={action} method="post" className="grid gap-2">
            <input type="hidden" name="accion" value="pregunta" />
            <input type="hidden" name="tab" value="preguntas" />
            <input type="hidden" name="question_id" value={question.id} />
            <input name="prompt" defaultValue={question.prompt} />
            <SheetSubmit>Guardar pregunta</SheetSubmit>
          </form>
        </FormSheet>
      ))}
      {options.map((option) => (
        <FormSheet key={`${option.question_id}-${option.value}`} action="Editar" resource="opción">
          <form action={action} method="post" className="grid gap-2">
            <input type="hidden" name="accion" value="opcion" />
            <input type="hidden" name="tab" value="opciones" />
            <input type="hidden" name="question_id" value={option.question_id} />
            <input type="hidden" name="value" value={option.value} />
            <input name="label" defaultValue={option.label} />
            <input name="points" type="number" />
            <input name="severity" type="number" />
            <SheetSubmit>Guardar opción</SheetSubmit>
          </form>
        </FormSheet>
      ))}
      {bands.map((band) => (
        <FormSheet key={band.level} action="Editar" resource="banda">
          <form action={action} method="post" className="grid gap-2">
            <input type="hidden" name="accion" value="banda" />
            <input type="hidden" name="tab" value="bandas" />
            <input type="hidden" name="level" value={band.level} />
            <input name="min_score" type="number" defaultValue={band.min_score} />
            <input name="max_score" type="number" defaultValue={band.max_score} />
            <input name="riesgo" defaultValue={band.riesgo} />
            <input name="reto" defaultValue={band.reto} />
            <SheetSubmit>Guardar banda</SheetSubmit>
          </form>
        </FormSheet>
      ))}
      <FormSheet action="Crear" resource="condición">
        <form action={action} method="post" className="grid gap-2">
          <input type="hidden" name="accion" value="condicion" />
          <input type="hidden" name="tab" value="condiciones" />
          <input name="question_id" type="number" />
          <input name="depends_on_question_id" type="number" />
          <input name="expected_value" />
          <SheetSubmit>Agregar condición</SheetSubmit>
        </form>
      </FormSheet>
    </div>
  );
}
