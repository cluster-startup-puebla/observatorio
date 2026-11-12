type Choice = { question_id: string; option_value: string; rank?: number | null };
type Question = { id: string; prompt: string | null };
type Option = { question_id: string; value: string; label: string | null };

export type AnswerLine = { key: string; prompt: string; label: string };

export function answerLines(choices: Choice[], questions: Question[], options: Option[]): AnswerLine[] {
  const prompts = new Map(questions.map((row) => [row.id, row.prompt ?? ""]));
  const labels = new Map(options.map((row) => [`${row.question_id}:${row.value}`, row.label ?? ""]));
  return [...choices]
    .sort((left, right) => (left.rank ?? 0) - (right.rank ?? 0))
    .map((choice, index) => {
      const prompt = prompts.get(choice.question_id) ?? "";
      const label = labels.get(`${choice.question_id}:${choice.option_value}`) || choice.option_value;
      return { key: `${choice.question_id}-${index}`, prompt, label };
    });
}

export async function loadAnswerLines(choices: Choice[]) {
  if (!choices.length) return [];
  const { adminDb } = await import("@/lib/admin/admin-db");
  const db = await adminDb();
  if (!db) return [];
  const ids = [...new Set(choices.map((row) => row.question_id))];
  const [questions, options] = await Promise.all([
    db.from("questions").select("id, prompt").in("id", ids),
    db.from("question_options").select("question_id, value, label").in("question_id", ids),
  ]);
  if (questions.error) throw new Error(questions.error.message);
  if (options.error) throw new Error(options.error.message);
  return answerLines(choices, questions.data ?? [], options.data ?? []);
}
