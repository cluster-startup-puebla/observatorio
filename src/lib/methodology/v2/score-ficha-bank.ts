import { readFileSync } from "node:fs";
import { V2_EXAMPLES } from "./examples";
import type { V2Question } from "./types";

function loadQuestions(path: string): V2Question[] {
  const file = new URL(`../../../content/methodology/v2/${path}`, import.meta.url);
  return JSON.parse(readFileSync(file, "utf8")).questions;
}

export const realN1 = loadQuestions("n1.json");

export const realN2: Record<string, V2Question[]> = Object.fromEntries(
  V2_EXAMPLES.map((example) => [example.sectorId, loadQuestions(`n2/${example.sectorId}.json`)]),
);

export const TECH_PREFIX: Record<string, string> = {
  automotriz: "AU",
  plasticos: "PL",
  "medico-hospitalario": "MD",
  logistica: "LG",
};

export function n1Question(id: string): V2Question {
  const question = realN1.find((item) => item.id === id);
  if (!question) throw new Error(`real n1 question ${id} exists`);
  return question;
}

export function n2Question(sectorId: string, n: number): V2Question {
  const id = `${TECH_PREFIX[sectorId]}-TECH-0${n}`;
  const question = realN2[sectorId].find((item) => item.id === id);
  if (!question) throw new Error(`real n2 question ${id} exists`);
  return question;
}

export function hasScore(question: V2Question, score: number): boolean {
  return (question.options ?? []).some((option) => option.score === score);
}
