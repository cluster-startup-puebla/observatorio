"use client";

import { useEffect } from "react";
import { levelStepFor, type V2Band, type V2LevelStep } from "@/lib/methodology/v2/bands";
import type { V2Draft } from "@/lib/methodology/v2/draft";
import { scoreLive } from "@/lib/methodology/v2/live";
import { buildReport } from "@/lib/methodology/v2/report";
import type { V2Answers, V2Question } from "@/lib/methodology/v2/types";
import { Pentagon } from "./pentagon";
import { ScoreBars } from "./score-bars";
import { Steps } from "./steps";

const BAND_LABEL: Record<V2Band, string> = { platino: "Platino", oro: "Oro", plata: "Plata", bronce: "Bronce" };

type DoneFlush = (draft: V2Draft, entering: "done", score: { ismsNivel2: number; band: V2Band | null }) => void;

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
  scheduleFlush?: DoneFlush;
}) {
  let live = null as ReturnType<typeof scoreLive> | null;
  try {
    live = scoreLive(questions, answers);
  } catch {
    live = null;
  }
  const report = buildReport(questions, answers, live?.ib ?? null);
  const note = live?.ismsNivel2 ?? null;
  const step = note === null ? null : levelStepFor(note, roadmap);
  const band = step?.band ?? live?.band ?? null;

  useEffect(() => {
    if (!scheduleFlush || note === null) return;
    scheduleFlush({ ...draft, phase: "done" }, "done", { ismsNivel2: note, band });
  }, [scheduleFlush, note, band, draft]);

  const retry = draft.sentAt === null || draft.sentAt < draft.updatedAt;
  const sat = !live || live.satNivel2 === null ? "sin nota" : live.satNivel2.toFixed(2);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-8 px-4 py-8">
      {note === null ? (
        <p className="text-body text-ink">Faltan respuestas para la nota.</p>
      ) : (
        <section className="space-y-1 text-center">
          {step ? <p className="text-small font-semibold text-brand">{BAND_LABEL[step.band]}</p> : null}
          <p className="text-h1 text-ink tabular-nums">{note.toFixed(2)}</p>
        </section>
      )}
      {live ? <ScoreBars score={live} /> : null}
      {live ? (
        <p className="text-small leading-relaxed text-ink-secondary">
          La dirección reporta {live.ismsNivel1.toFixed(2)}. La operación, {sat}. {report.gapZone ?? "—"}
        </p>
      ) : null}
      <Pentagon questions={questions} answers={answers} />
      <Steps step={step} signals={report.signals} />
      {retry ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            onRetry?.();
            if (!scheduleFlush || note === null) return;
            scheduleFlush({ ...draft, phase: "done" }, "done", { ismsNivel2: note, band });
          }}
        >
          Reintentar envío
        </button>
      ) : null}
    </main>
  );
}
