import type { V2Question } from "./types";

export function sessionQuestions(n1: V2Question[], n2: V2Question[], sectorQuestionId: string) {
  return [...n1.filter((question) => question.id !== sectorQuestionId), ...n2];
}
