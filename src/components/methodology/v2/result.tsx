"use client";

import type { V2LevelStep } from "@/lib/methodology/v2/bands";
import type { V2Draft } from "@/lib/methodology/v2/draft";
import { readResult } from "@/lib/methodology/v2/read-result";
import type { V2Answers, V2Question } from "@/lib/methodology/v2/types";
import { FinishConfetti } from "./finish-confetti";
import { ResultRetry, useResultSend } from "./result-retry";
import { ResultView } from "./result-view";

export function Result({
  questions,
  answers,
  roadmap,
  draft,
  celebrate = false,
  onRetry,
  scheduleFlush,
}: {
  questions: V2Question[];
  answers: V2Answers;
  roadmap: V2LevelStep[];
  draft: V2Draft;
  celebrate?: boolean;
  onRetry?: () => void;
  scheduleFlush?: Parameters<typeof useResultSend>[0];
}) {
  const read = readResult(questions, answers, roadmap);
  const send = useResultSend(scheduleFlush, draft, read.note, read.band);

  return (
    <main className="mx-auto flex w-full min-w-0 max-w-lg flex-col gap-8 overflow-x-clip px-4 py-8">
      <ResultView
        read={read}
        questions={questions}
        answers={answers}
        celebration={celebrate && read.shown !== null ? <FinishConfetti /> : null}
      />
      {send.failed ? (
        <ResultRetry
          onRetry={() => {
            onRetry?.();
            send.retry();
          }}
        />
      ) : null}
    </main>
  );
}
