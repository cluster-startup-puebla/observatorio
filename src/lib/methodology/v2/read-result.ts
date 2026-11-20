import { levelStepFor, type V2Band, type V2LevelStep } from "./bands";
import { scoreLive, type V2LiveScore } from "./live";
import { buildReport, type V2Report } from "./report";
import type { V2Answers, V2Question } from "./types";

export type ReadResult = {
  live: V2LiveScore | null;
  report: V2Report;
  note: number | null;
  shown: number | null;
  step: V2LevelStep | null;
  band: V2Band | null;
};

const emptyReport: V2Report = {
  profile: [],
  frictions: [],
  gapZone: null,
  underuse: null,
  frontier: null,
  control: null,
  traceability: null,
  sophistication: [],
  clubs: [],
  demand: null,
  signals: [],
};

export function readResult(questions: V2Question[], answers: V2Answers, roadmap: V2LevelStep[]): ReadResult {
  try {
    const live = scoreLive(questions, answers);
    const report = buildReport(questions, answers, live.ib);
    const note = live.ismsNivel2;
    const shown = note ?? live.ismsNivel1;
    const step = levelStepFor(shown, roadmap);
    return { live, report, note, shown, step, band: step?.band ?? live.band };
  } catch {
    return { live: null, report: emptyReport, note: null, shown: null, step: null, band: null };
  }
}
