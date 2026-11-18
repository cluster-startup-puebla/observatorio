import { bandFor, type V2Band } from "./bands";
import type { V2Answers, V2Question } from "./types";

export interface V2Score {
  estadoDerecho: number;
  innovacion: number;
  comercial: number;
  ismsNivel1: number;
  satNivel2: number;
  ismsNivel2: number;
  ib: number;
  band: V2Band;
}

const ED_IDS = ["ED-01", "ED-02", "ED-03", "ED-04", "ED-05"];
const INO_IDS = ["INO-01", "INO-02", "INO-03", "INO-04"];
const COM_IDS = ["COM-01", "COM-02", "COM-03"];
const SAT_IDS = ["P1", "P2", "P3", "P4", "P5", "TECH-06", "TECH-07"];
const P5_FALLBACK = 60;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function itemScore(questions: V2Question[], answers: V2Answers, id: string): number {
  const question = questions.find((q) => q.id === id);
  if (!question) throw new Error(`Missing question: ${id}`);
  const answer = answers[id];
  if (!answer) throw new Error(`Missing answer: ${id}`);
  if (answer.kind === "rank") throw new Error(`Unsupported rank answer for scored question: ${id}`);
  if (!("optionValue" in answer)) throw new Error(`Unknown option "undefined" for question: ${id}`);

  if (id === "P5" && answer.kind === "text") return P5_FALLBACK;

  const option = question.options?.find((o) => o.value === answer.optionValue);
  if (!option) throw new Error(`Unknown option "${answer.optionValue}" for question: ${id}`);
  if (option.score === null) {
    if (id === "P5") return P5_FALLBACK;
    throw new Error(`Option "${answer.optionValue}" has null score for question: ${id}`);
  }
  return option.score;
}

function groupMean(questions: V2Question[], answers: V2Answers, ids: string[]): number {
  return mean(ids.map((id) => itemScore(questions, answers, id)));
}

export function scoreV2(questions: V2Question[], answers: V2Answers): V2Score {
  const edRaw = groupMean(questions, answers, ED_IDS);
  const inoRaw = groupMean(questions, answers, INO_IDS);
  const comRaw = groupMean(questions, answers, COM_IDS);

  const estadoDerecho = round2(edRaw);
  const innovacion = round2(inoRaw);
  const comercial = round2(comRaw);
  const satNivel2 = round2(groupMean(questions, answers, SAT_IDS));

  // NOTE: weighting the already-rounded components (e.g. comercial = 83.33) yields
  // 62.67 / 68.02 for Automotriz / Hospital, which contradicts the ficha (62.68 / 68.03).
  // The ficha only reproduces when nivel 1 is weighted from the unrounded means.
  const ismsNivel1 = round2(0.4 * edRaw + 0.3 * inoRaw + 0.3 * comRaw);
  const ismsNivel2 = round2(0.5 * ismsNivel1 + 0.5 * satNivel2);
  const ib = round2(ismsNivel1 - satNivel2);

  return {
    estadoDerecho,
    innovacion,
    comercial,
    ismsNivel1,
    satNivel2,
    ismsNivel2,
    ib,
    band: bandFor(ismsNivel2),
  };
}
