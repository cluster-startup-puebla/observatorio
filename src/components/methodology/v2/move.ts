import type { V2Draft } from "@/lib/methodology/v2/draft";
import type { V2Answer } from "@/lib/methodology/v2/types";

const sectorQuestionId = "MOD0-WEB-01";

export function openDraft(initial: V2Draft | null, instrumentId: string): V2Draft {
  const blank: V2Draft = {
    instrumentId,
    answers: {},
    index: 0,
    phase: "general",
    updatedAt: new Date().toISOString(),
    sentAt: null,
  };
  const base = initial ?? blank;
  return {
    ...base,
    instrumentId,
    answers: {
      ...base.answers,
      [sectorQuestionId]: { kind: "single", optionValue: instrumentId },
    },
  };
}

export function touch(draft: V2Draft, patch: Partial<V2Draft>): V2Draft {
  return {
    ...draft,
    ...patch,
    updatedAt: new Date().toISOString(),
    sentAt: draft.sentAt,
  };
}

export function withAnswer(draft: V2Draft, questionId: string, answer: V2Answer): V2Draft {
  return touch(draft, { answers: { ...draft.answers, [questionId]: answer } });
}
