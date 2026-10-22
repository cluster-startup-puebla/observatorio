import { FormSheet } from "@/components/admin/form-sheet";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function QuestionForms({
  action,
  questions,
}: {
  action: string;
  questions: { id: number; prompt: string }[];
}) {
  return (
    <>
      {questions.map((question) => (
        <FormSheet key={question.id} action="Editar" resource="pregunta">
          <form action={action} method="post" className="grid gap-3">
            <input type="hidden" name="accion" value="pregunta" />
            <input type="hidden" name="tab" value="preguntas" />
            <input type="hidden" name="question_id" value={question.id} />
            <label className="grid gap-1 text-small">
              Pregunta
              <input name="prompt" defaultValue={question.prompt} className="rounded-lg border border-line px-3 py-2" />
            </label>
            <SheetSubmit>Guardar pregunta</SheetSubmit>
          </form>
        </FormSheet>
      ))}
    </>
  );
}
