import type { ReactNode } from "react";
import type { V2Band } from "@/lib/methodology/v2/bands";
import type { ReadResult } from "@/lib/methodology/v2/read-result";
import type { V2Answers, V2Question } from "@/lib/methodology/v2/types";
import { Pentagon } from "./pentagon";
import { ResultNote } from "./result-note";
import { ResultReport } from "./result-report";
import { ScoreBars } from "./score-bars";
import { SectorRank } from "./sector-rank";
import { Steps } from "./steps";

const BAND_LABEL: Record<V2Band, string> = {
  platino: "Platino",
  oro: "Oro",
  plata: "Plata",
  bronce: "Bronce",
};

export function ResultView({
  read,
  questions,
  answers,
  celebration,
}: {
  read: ReadResult;
  questions: V2Question[];
  answers: V2Answers;
  celebration?: ReactNode;
}) {
  const { live, report, note, shown, step } = read;
  const band = step ? BAND_LABEL[step.band] : null;
  return (
    <div className="grid gap-8">
      {shown === null ? null : celebration}
      {shown === null ? (
        <p className="text-body text-ink">Faltan respuestas para la nota.</p>
      ) : (
        <ResultNote shown={shown} together={note !== null} band={band} />
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
    </div>
  );
}
