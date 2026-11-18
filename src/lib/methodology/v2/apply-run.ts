import type { V2Phase } from "./draft";
import type { V2Answers } from "./types";

export type RunScore = { ismsNivel2?: number; band?: string } | null;

export type RunRow = {
  instrument_id: string;
  answers: V2Answers;
  cursor: number;
  phase: V2Phase;
  started_at: string;
  finished_at: string | null;
  score: RunScore;
  updated_at: string;
};

export type RunInput = {
  instrumentId: string;
  answers: V2Answers;
  index: number;
  phase: V2Phase;
  score: RunScore;
  updatedAt: string;
};

function scored(input: RunInput) {
  return input.phase === "done" && typeof input.score?.ismsNivel2 === "number";
}

function closing(current: RunRow | null, input: RunInput, now: string) {
  if (scored(input)) return { finished_at: now, score: input.score };
  return { finished_at: current?.finished_at ?? null, score: current?.score ?? null };
}

export function applyRun(current: RunRow | null, input: RunInput, now: string) {
  if (current && current.updated_at > input.updatedAt) return { wrote: false, row: current };
  const close = closing(current, input, now);
  const row: RunRow = {
    instrument_id: input.instrumentId,
    answers: input.answers,
    cursor: input.index,
    phase: input.phase,
    started_at: current ? current.started_at : now,
    finished_at: close.finished_at,
    score: close.score,
    updated_at: input.updatedAt,
  };
  return { wrote: true, row };
}
