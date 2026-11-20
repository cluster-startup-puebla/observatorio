import indexFile from "@/content/methodology/v2/index.json";
import n1File from "@/content/methodology/v2/n1.json";
import { readResult } from "@/lib/methodology/v2/read-result";
import { loadSector } from "@/lib/methodology/v2/load-sector";
import { sessionQuestions } from "@/lib/methodology/v2/sequence";
import type { V2Answers, V2Question } from "@/lib/methodology/v2/types";
import { evaluationTrace } from "./evaluation-trace";
import type { CompanyResult } from "./company-score";

const n1 = n1File.questions as V2Question[];
const sectorQuestionId = indexFile.sectorQuestionId;

export type StoredRun = {
  phase?: string;
  instrument_id?: string;
  answers?: unknown;
  finished_at?: string | null;
  score?: { ismsNivel2?: number } | null;
};

export async function companyResult(run: StoredRun | null): Promise<CompanyResult | null> {
  if (run?.phase !== "done" || typeof run.instrument_id !== "string") return null;
  if (!run.answers || typeof run.answers !== "object" || Array.isArray(run.answers)) return null;
  const sector = await loadSector(run.instrument_id);
  if (!sector) return null;
  const questions = sessionQuestions(n1, sector.questions, sectorQuestionId);
  const answers = run.answers as V2Answers;
  const read = readResult(questions, answers, sector.roadmap);
  if (read.shown === null) return null;
  const stored = run.score?.ismsNivel2;
  return {
    questions,
    answers,
    roadmap: sector.roadmap,
    trace: evaluationTrace({
      finishedAt: run.finished_at ?? null,
      instrumentId: run.instrument_id,
      band: read.band,
      ismsNivel2: typeof stored === "number" ? stored : read.note,
      actions: read.step?.actions ?? [],
      signals: read.report.signals,
    }),
  };
}
