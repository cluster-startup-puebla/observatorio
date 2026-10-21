import { AutoSubmit } from "@/components/auto-submit";
import { saveMethodologyForm } from "@/lib/flow-actions";
import type { Question } from "@/lib/methodology/instrument";

export function QuestionStep({
  persona,
  question,
  saved,
}: {
  persona: string;
  question: Question;
  saved: string;
}) {
  return (
    <form action={saveMethodologyForm} className="grid gap-6">
      <input type="hidden" name="persona" value={persona} />
      <input type="hidden" name="pregunta" value={String(question.id)} />
      <fieldset className="grid gap-3">
        <legend className="text-body-lg text-ink">{question.text}</legend>
        {question.options.map((option) => (
          <label key={option.value} className="flex items-center gap-3 text-body text-ink">
            <input
              type="radio"
              name="valor"
              value={option.value}
              defaultChecked={saved === option.value}
              data-metodologia-radio=""
            />
            {option.label}
          </label>
        ))}
      </fieldset>
      {saved ? <p className="text-small font-semibold text-ink">Guardada</p> : null}
      <AutoSubmit selector="[data-metodologia-radio]" readyTestId="metodologia-lista" />
    </form>
  );
}
