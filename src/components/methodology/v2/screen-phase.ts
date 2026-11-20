import { draftKey, readDraft, type DraftStore, type V2Draft } from "@/lib/methodology/v2/draft";
import { pickDraft } from "@/lib/methodology/v2/recover";
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
  if (choice.kind === "none") return "";
  if (remote?.instrumentId && ids.includes(remote.instrumentId)) return remote.instrumentId;
  return "";
}

export function showResult(draft: V2Draft | null, total: number) {
  if (!draft || total < 1) return false;
  return draft.phase === "done" || draft.index >= total;
}

export function resumeDraft(local: V2Draft | null, remote: V2Draft | null, total: number): V2Draft | null {
  if (remote?.phase === "done") return pickDraft(local, remote);
  const picked = pickDraft(local, remote);
  if (!picked) return null;
  if (picked.phase === "done" || (total > 0 && picked.index >= total)) return null;
  return picked;
}

type SavedStore = DraftStore & { removeItem(key: string): void };
type SavedPack = { id: string; questions: unknown[] };

export function openSavedDraft(store: SavedStore, profileId: string, remote: V2Draft | null, packs: SavedPack[]) {
  const local = readDraft(store, profileId);
  const total = packs.find((item) => item.id === local?.instrumentId)?.questions.length ?? 0;
  const next = resumeDraft(local, remote, total);
  if (local && !next) store.removeItem(draftKey(profileId));
  return next;
}

export function showCurtain(draft: V2Draft | null, questions: V2Question[]) {
  if (!draft || draft.phase === "sector" || draft.phase === "done") return false;
  if (draft.phase === "curtain") return true;
  return questions[draft.index]?.level === "n2";
}
