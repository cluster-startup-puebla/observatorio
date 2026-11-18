import type { V2Draft } from "@/lib/methodology/v2/draft";
import type { InstrumentChoice } from "@/lib/methodology/v2/sector-map";
import type { V2Question } from "@/lib/methodology/v2/types";

export function freshDraft(instrumentId: string): V2Draft {
  return {
    instrumentId,
    answers: {},
    index: 0,
    phase: "general",
    updatedAt: new Date().toISOString(),
    sentAt: null,
  };
}

export function initialInstrument(remote: V2Draft | null, choice: InstrumentChoice, ids: string[]) {
  if (choice.kind === "one") return choice.id;
  if (remote?.instrumentId && ids.includes(remote.instrumentId)) return remote.instrumentId;
  return "";
}

export function showResult(draft: V2Draft | null, total: number) {
  if (!draft || total < 1) return false;
  return draft.phase === "done" || draft.index >= total;
}

export function showCurtain(draft: V2Draft | null, questions: V2Question[]) {
  if (!draft || draft.phase === "sector" || draft.phase === "done") return false;
  if (draft.phase === "curtain") return true;
  return questions[draft.index]?.level === "n2";
}
