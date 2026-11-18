import { ordinalScore } from "./ordinal";
import type { V2Answer, V2Question } from "./types";

export const SAT_ID_PATTERN = /(?:^|-)TECH-0([1-7])$/;
export const SYNTHETIC_SAT_IDS: Record<string, number> = {
  P1: 1,
  P2: 2,
  P3: 3,
  P4: 4,
  P5: 5,
};
export const FIVE_STEP = [20, 40, 60, 80, 100];

const P5_SCORE = 60;

export function satSlot(id: string): number | null {
  const match = SAT_ID_PATTERN.exec(id);
  if (match) return Number(match[1]);
  return SYNTHETIC_SAT_IDS[id] ?? null;
}

export function selectedOption(question: V2Question, answer: V2Answer | undefined) {
  if (!answer) throw new Error(`Missing answer: ${question.id}`);
  if (answer.kind === "rank") {
    throw new Error(`Unsupported rank answer for scored question: ${question.id}`);
  }
  if (answer.kind !== "single" && answer.kind !== "text") {
    throw new Error(`Unsupported ${answer.kind} answer for scored question: ${question.id}`);
  }
  const options = question.options ?? [];
  const index = options.findIndex((option) => option.value === answer.optionValue);
  if (index < 0) {
    throw new Error(`Unknown option "${answer.optionValue}" for question: ${question.id}`);
  }
  return { option: options[index], index };
}

export function satItemScore(
  question: V2Question,
  answer: V2Answer | undefined,
  slot: number,
): number | null {
  if (!answer) return null;
  if (slot === 5) return P5_SCORE;
  if (slot === 1 && answer.kind === "checks") return Math.min(100, answer.selected.length * 20);
  if (answer.kind === "rank" || answer.kind === "checks") return null;
  const { option, index } = selectedOption(question, answer);
  if (option.score !== null) return option.score;
  if (slot === 6 || slot === 7) return ordinalScore(question.id, index);
  if (slot === 1) return 20;
  return index < FIVE_STEP.length ? FIVE_STEP[index] : null;
}

export function techItemScore(question: V2Question, answer: V2Answer | undefined): number | null {
  const slot = satSlot(question.id);
  if (slot === null) return null;
  return satItemScore(question, answer, slot);
}
