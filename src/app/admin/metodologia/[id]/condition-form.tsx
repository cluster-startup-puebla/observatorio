"use client";

import { FormSheet } from "@/components/admin/form-sheet";
import { SearchCombobox } from "@/components/admin/search-combobox";
import { SheetSubmit } from "@/components/admin/sheet-submit";

export function ConditionForm({
  action,
  questions,
}: {
  action: string;
  questions: { id: number; prompt: string }[];
}) {
  const items = questions.map((question) => ({
    id: String(question.id),
    label: `${question.id}. ${question.prompt}`,
  }));
  return (
    <FormSheet action="Crear" resource="condición">
      <form action={action} method="post" className="grid gap-3">
        <input type="hidden" name="accion" value="condicion" />
        <input type="hidden" name="tab" value="condiciones" />
        <label className="grid gap-1 text-small" htmlFor="cond-question">
          Pregunta
          <SearchCombobox id="cond-question" name="question_id" noneLabel="Elige pregunta" items={items} listLabel="Pregunta" />
        </label>
        <label className="grid gap-1 text-small" htmlFor="cond-depends">
          Depende de
          <SearchCombobox id="cond-depends" name="depends_on_question_id" noneLabel="Elige pregunta" items={items} listLabel="Depende de" />
        </label>
        <label className="grid gap-1 text-small">
          Valor esperado
          <input name="expected_value" required className="rounded-lg border border-line px-3 py-2" />
        </label>
        <SheetSubmit>Agregar condición</SheetSubmit>
      </form>
    </FormSheet>
  );
}
