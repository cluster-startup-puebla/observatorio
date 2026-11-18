import type { V2Answer, V2Question } from "./types";

export function complete(question: V2Question, answer: V2Answer | undefined): boolean {
  if (!answer) return false;
  if (question.type === "multi_select") return answer.kind === "checks";
  if (question.type === "rank") {
    if (answer.kind !== "rank" || !question.factors) return false;
    const ranks = question.factors.map((factor) => answer.ranks[factor.id]);
    if (ranks.some((rank) => rank == null)) return false;
    return new Set(ranks).size === question.factors.length;
  }
  if (question.type === "single_select_text") {
    if (answer.kind !== "text" || !answer.optionValue) return false;
    if (question.text?.optionValue && answer.optionValue === question.text.optionValue) {
      return answer.text.trim().length > 0;
    }
    return true;
  }
  return answer.kind === "single" && answer.optionValue.length > 0;
}
