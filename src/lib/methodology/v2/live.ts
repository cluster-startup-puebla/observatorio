import { bandFor, type V2Band } from "./bands";
import { ordinalScore } from "./ordinal";
import { satItemScore, satSlot, selectedOption } from "./sat";
import type { V2Answers, V2Question } from "./types";

export interface V2LiveScore {
  estadoDerecho: number;
  innovacion: number;
  comercial: number;
  ismsNivel1: number;
  satNivel2: number | null;
  ismsNivel2: number | null;
  ib: number | null;
  band: V2Band | null;
  missing: string[];
}

const ED_IDS = ["ED-01", "ED-02", "ED-03", "ED-04", "ED-05"];
const INO_IDS = ["INO-01", "INO-02", "INO-03", "INO-04"];
const COM_IDS = ["COM-01", "COM-02", "COM-03"];
const SAT_SLOTS = [1, 2, 3, 4, 5, 6, 7];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function liveGroupMean(
  questions: V2Question[],
  answers: V2Answers,
  ids: string[],
  ordinalFallback: boolean,
): number {
  const scores = ids.map((id) => {
    const question = questions.find((item) => item.id === id);
    if (!question) throw new Error(`Missing question: ${id}`);
    const picked = selectedOption(question, answers[id]);
    if (picked.option.score !== null) return picked.option.score;
    if (ordinalFallback) return ordinalScore(id, picked.index);
    throw new Error(`Option "${picked.option.value}" has null score for question: ${id}`);
  });
  return mean(scores);
}

export function scoreLive(questions: V2Question[], answers: V2Answers): V2LiveScore {
  const edRaw = liveGroupMean(questions, answers, ED_IDS, false);
  const inoRaw = liveGroupMean(questions, answers, INO_IDS, true);
  const comRaw = liveGroupMean(questions, answers, COM_IDS, true);
  const estadoDerecho = round2(edRaw);
  const innovacion = round2(inoRaw);
  const comercial = round2(comRaw);
  const ismsNivel1 = round2(0.4 * edRaw + 0.3 * inoRaw + 0.3 * comRaw);
  const missing: string[] = [];
  const satScores = new Map<number, number>();

  for (const question of questions) {
    const slot = satSlot(question.id);
    if (slot === null) continue;
    const score = satItemScore(question, answers[question.id], slot);
    if (score === null) {
      missing.push(question.id);
      continue;
    }
    satScores.set(slot, score);
  }

  const complete = missing.length === 0 && SAT_SLOTS.every((slot) => satScores.has(slot));
  const satNivel2 = complete ? round2(mean([...satScores.values()])) : null;
  const ismsNivel2 = satNivel2 === null ? null : round2(0.5 * ismsNivel1 + 0.5 * satNivel2);
  const ib = satNivel2 === null ? null : round2(ismsNivel1 - satNivel2);

  return {
    estadoDerecho,
    innovacion,
    comercial,
    ismsNivel1,
    satNivel2,
    ismsNivel2,
    ib,
    band: ismsNivel2 === null ? null : bandFor(ismsNivel2),
    missing,
  };
}
