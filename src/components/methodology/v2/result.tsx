"use client";

import { useEffect } from "react";
import { levelStepFor, type V2Band, type V2LevelStep } from "@/lib/methodology/v2/bands";
import type { V2Draft } from "@/lib/methodology/v2/draft";
import { scoreLive } from "@/lib/methodology/v2/live";
import { buildReport } from "@/lib/methodology/v2/report";
import type { V2Answers, V2Question } from "@/lib/methodology/v2/types";
import { FinishConfetti } from "./finish-confetti";
import { Pentagon } from "./pentagon";
import { flushDone } from "./result-flush";
import { ResultNote } from "./result-note";
import { ResultReport } from "./result-report";
import { ScoreBars } from "./score-bars";
import { SectorRank } from "./sector-rank";
import { Steps } from "./steps";

const BAND_LABEL: Record<V2Band, string> = { platino: "Platino", oro: "Oro", plata: "Plata", bronce: "Bronce" };

export function Result({
  questions,
  answers,
  roadmap,
  draft,
  onRetry,
  scheduleFlush,
}: {
  questions: V2Question[];
  answers: V2Answers;
  roadmap: V2LevelStep[];
  draft: V2Draft;
  onRetry?: () => void;
  scheduleFlush?: Parameters<typeof flushDone>[0];
}) {
  let live = null as ReturnType<typeof scoreLive> | null;
  try {
    live = scoreLive(questions, answers);
  } catch {
    live = null;
  }
  const report = buildReport(questions, answers, live?.ib ?? null);
  const note = live?.ismsNivel2 ?? null;
  const shown = note ?? live?.ismsNivel1 ?? null;
  const step = shown === null ? null : levelStepFor(shown, roadmap);
  const band = step?.band ?? live?.band ?? null;

  useEffect(() => {
    flushDone(scheduleFlush, draft, note, band);
  }, [scheduleFlush, note, band, draft]);

  const retry = draft.sentAt === null || draft.sentAt < draft.updatedAt;

  return (
    <main className="mx-auto flex w-full min-w-0 max-w-lg flex-col gap-8 overflow-x-clip px-4 py-8">
      {shown === null ? null : <FinishConfetti />}
      {shown === null ? (
        <p className="text-body text-ink">Faltan respuestas para la nota.</p>
      ) : (
        <ResultNote shown={shown} together={note !== null} band={step ? BAND_LABEL[step.band] : null} />
      )}
      {live ? <ScoreBars score={live} /> : null}
      {live && live.satNivel2 !== null ? (
        <p className="rounded-2xl border border-line bg-elevated px-4 py-3 text-sm leading-relaxed break-words text-ink">
          La dirección reporta {live.ismsNivel1.toFixed(2)}. La operación, {live.satNivel2.toFixed(2)}.
          {report.gapZone ? ` ${report.gapZone}.` : ""}
        </p>
      ) : null}
      {shown !== null ? <SectorRank /> : null}
      <Pentagon questions={questions} answers={answers} />
      <ResultReport report={report} />
      <Steps step={step} signals={report.signals} />
      {retry ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            onRetry?.();
            flushDone(scheduleFlush, draft, note, band);
          }}
        >
          Reintentar envío
        </button>
      ) : null}
    </main>
  );
}
