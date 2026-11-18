"use client";

import { useState } from "react";
import { QuestionBody } from "@/components/methodology/v2/body";
import { openDraft, touch, withAnswer } from "@/components/methodology/v2/move";
import { QuestionFrame } from "@/components/methodology/v2/question-frame";
import { scheduleFlush } from "@/components/methodology/v2/sync";
import { complete } from "@/lib/methodology/v2/complete";
import { writeDraft, type V2Draft } from "@/lib/methodology/v2/draft";
import type { V2Answer, V2Question } from "@/lib/methodology/v2/types";

export function V2Form({
  profileId,
  instrumentId,
  questions,
  initial,
}: {
  profileId: string;
  instrumentId: string;
  questions: V2Question[];
  initial: V2Draft | null;
}) {
  const [draft, setDraft] = useState(() => openDraft(initial, instrumentId));
  const question = questions[draft.index];

  function commit(next: V2Draft) {
    writeDraft(localStorage, profileId, next);
    setDraft(next);
    scheduleFlush(next, "answer");
  }

  if (!question) return null;

  const answer = draft.answers[question.id];

  return (
    <QuestionFrame
      tone={question.level === "n1" ? "brand" : "navy"}
      progress={((draft.index + 1) / questions.length) * 100}
      kicker={question.section}
      kickerMeta={`${draft.index + 1}/${questions.length}`}
      title={question.prompt || question.title}
      canContinue={complete(question, answer)}
      continueLabel="Continuar"
      onBack={() => {
        if (draft.index < 1) return;
        commit(touch(draft, { index: draft.index - 1 }));
      }}
      onContinue={() => {
        if (!complete(question, answer)) return;
        commit(touch(draft, { index: draft.index + 1 }));
      }}
    >
      <QuestionBody
        question={question}
        answer={answer}
        onChange={(next: V2Answer) => commit(withAnswer(draft, question.id, next))}
      />
    </QuestionFrame>
  );
}
