import { BandForms } from "@/app/admin/metodologia/[id]/band-forms";
import { ConditionForm } from "@/app/admin/metodologia/[id]/condition-form";
import { OptionForms } from "@/app/admin/metodologia/[id]/option-forms";
import { QuestionForms } from "@/app/admin/metodologia/[id]/question-forms";
import { SectionEditForm } from "@/app/admin/metodologia/[id]/section-edit";

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
      <SectionEditForm action={action} section={section} />
      <QuestionForms action={action} questions={questions} />
      <OptionForms action={action} options={options} />
      <BandForms action={action} bands={bands} />
      <ConditionForm action={action} questions={questions} />
    </div>
  );
}
