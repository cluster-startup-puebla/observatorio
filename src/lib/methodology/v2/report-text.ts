import type { V2Answer, V2Answers, V2Question } from "./types";

export const SOPHISTICATION_TITLES = [
  "A qué te puedes reconvertir pronto",
  "Qué parte de la venta está en riesgo",
  "Qué tan sostenible se ve",
] as const;

export const CLUB_TITLES = [
  "Compartir un centro o laboratorio",
  "Compartir un proceso que hoy se manda fuera",
  "Comprar junto con otras empresas",
] as const;

export function choiceLabel(question: V2Question, answer: V2Answer | undefined): string | null {
  if (!answer || answer.kind === "rank" || answer.kind === "checks") return null;
  const option = question.options?.find((item) => item.value === answer.optionValue);
  if (!option) return null;
  if (answer.kind === "text" && question.text?.optionValue === option.value && answer.text.trim()) {
    return answer.text.trim();
  }
  return option.label;
}

export function topRanks(question: V2Question, answer: V2Answer | undefined, count: number): string[] {
  if (!question.factors || answer?.kind !== "rank") return [];
  return Object.entries(answer.ranks)
    .sort((a, b) => a[1] - b[1])
    .slice(0, count)
    .map(([id]) => question.factors?.find((factor) => factor.id === id)?.label)
    .filter((label): label is string => Boolean(label));
}

export function frictionTitle(question: V2Question): string {
  const place = question.level === "n1" ? "en la región" : "en tu planta";
  if (question.id.includes("PROD")) {
    return question.level === "n1" ? "Lo que más traba afuera" : "Lo que más traba en la planta";
  }
  if (question.id.includes("MAT")) return `Lo que más encarece los insumos ${place}`;
  if (question.id.includes("SERV")) return `El servicio que más falta ${place}`;
  return "Fricciones";
}

export function titled(questions: V2Question[], answers: V2Answers, pattern: RegExp, titles: readonly string[]) {
  return questions.filter((question) => pattern.test(question.id)).flatMap((question) => {
    const label = choiceLabel(question, answers[question.id]);
    const slot = Number(question.id.match(/(\d+)$/)?.[1] ?? 0);
    return label ? [{ title: titles[slot - 1] ?? question.prompt, label }] : [];
  });
}
