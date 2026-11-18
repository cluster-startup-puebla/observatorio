import { readFileSync } from "node:fs";
import type { V2Answers, V2Question } from "./types";

function load(path: string): V2Question[] {
  return JSON.parse(readFileSync(`src/content/methodology/v2/${path}`, "utf8")).questions;
}

const n1 = load("n1.json");
const automotriz = load("n2/automotriz.json");

function pick(question: V2Question, index: number) {
  return { kind: "single" as const, optionValue: question.options![index].value };
}

const ED = [60, 40, 60, 40, 60];
const ORDINAL: Array<[string, number]> = [
  ["INO-01", 50],
  ["INO-02", 50],
  ["INO-03", 50],
  ["INO-04", 75],
  ["COM-01", 100],
  ["COM-02", 75],
  ["COM-03", 75],
];

export function liveSession() {
  const questions = [...n1, ...automotriz];
  const byId = (id: string) => questions.find((question) => question.id === id)!;
  const answers: V2Answers = {};
  ED.forEach((score, index) => {
    const id = `ED-0${index + 1}`;
    const question = byId(id);
    answers[id] = pick(question, question.options!.findIndex((option) => option.score === score));
  });
  for (const [id, value] of ORDINAL) answers[id] = pick(byId(id), value / 25 - 1);
  for (const slot of [1, 2, 3, 4, 5, 6, 7]) {
    answers[`AU-TECH-0${slot}`] = pick(byId(`AU-TECH-0${slot}`), slot >= 6 ? 1 : 0);
  }
  return { questions, answers };
}

function item(id: string, score: number, level: "n1" | "n2"): V2Question {
  return {
    id,
    level,
    sectorId: null,
    section: "test",
    widget: "test",
    title: id,
    prompt: id,
    microcopy: null,
    type: level === "n1" ? "likert_5" : "single_select",
    prefilled: false,
    options: [{ value: `${id}-opt`, label: id, score }],
  };
}

const SAT_IDS = ["P1", "P2", "P3", "P4", "P5", "TECH-06", "TECH-07"];

export function syntheticFixture() {
  const questions = [
    ...[40, 50, 50, 60, 60].map((score, index) => item(`ED-0${index + 1}`, score, "n1")),
    ...[50, 50, 62.5, 62.5].map((score, index) => item(`INO-0${index + 1}`, score, "n1")),
    ...[75, 75, 100].map((score, index) => item(`COM-0${index + 1}`, score, "n1")),
    ...[60, 60, 60, 60, 60, 50, 50].map((score, index) => item(SAT_IDS[index], score, "n2")),
  ];
  const answers: V2Answers = {};
  for (const question of questions) {
    answers[question.id] = { kind: "single", optionValue: `${question.id}-opt` };
  }
  return { questions, answers };
}
