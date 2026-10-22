import { calculateIntegralResult, type AnswerValue } from "@/lib/methodology/score";

export function levelFromChoices(rows: { question_id: number; option_value: string; rank: number | null }[]) {
  const grouped = new Map<number, { option_value: string; rank: number | null }[]>();
  for (const row of rows) {
    const list = grouped.get(row.question_id) ?? [];
    list.push(row);
    grouped.set(row.question_id, list);
  }
  const answers: Record<number, AnswerValue> = {};
  for (const [id, list] of grouped) {
    if (list.some((row) => row.rank !== null)) {
      const ranked: Record<string, number> = {};
      for (const row of list) if (row.rank) ranked[row.option_value] = row.rank;
      answers[id] = ranked;
    } else {
      answers[id] = list[0]?.option_value ?? "";
    }
  }
  const result = calculateIntegralResult(answers);
  return { category: result.category, totalScore: result.totalScore, stored: false as const };
}
