"use client";

import { useState } from "react";
import { QuestionBody } from "@/components/methodology/v2/body";
import { openDraft, stepDraft, withAnswer } from "@/components/methodology/v2/move";
import { QuestionFrame } from "@/components/methodology/v2/question-frame";
import { scheduleFlush } from "@/components/methodology/v2/sync";
import { complete } from "@/lib/methodology/v2/complete";
import { writeDraft, type V2Draft } from "@/lib/methodology/v2/draft";
import { modulePlace } from "@/lib/methodology/v2/modules";
import type { V2Answer, V2Question } from "@/lib/methodology/v2/types";

export function V2Form({
  profileId,
  instrumentId,
  questions,
  initial,
  onCommit,
}: {
  profileId: string;
  instrumentId: string;
  questions: V2Question[];
  initial: V2Draft | null;
  onCommit?: () => void;
}) {
  const [draft, setDraft] = useState(() => openDraft(initial, instrumentId));
  const question = questions[draft.index];

  function commit(next: V2Draft) {
    writeDraft(localStorage, profileId, next);
    setDraft(next);
    scheduleFlush(next, "answer");
    onCommit?.();
  }

  if (!question) return null;

  const answer = draft.answers[question.id];
  const place = modulePlace(questions, draft.index);

  return (
    <QuestionFrame
      tone={question.level === "n1" ? "brand" : "navy"}
      progress={place.progress}
      kicker={place.label}
      kickerMeta={place.meta}
      trail={question.level === "n1" ? "General" : "Específico de tu sector"}
      title={question.prompt || question.title}
      canContinue={complete(question, answer)}
      continueLabel={draft.index === questions.length - 1 ? "Cerrar" : "Continuar"}
      onBack={() => commit(stepDraft(draft, questions, -1))}
      onContinue={() => {
        if (!complete(question, answer)) return;
        commit(stepDraft(draft, questions, 1));
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
