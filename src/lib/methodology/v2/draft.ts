import type { V2Answers } from "./types";

export type V2Phase = "general" | "curtain" | "sector" | "done";

export type V2Draft = {
  instrumentId: string;
  answers: V2Answers;
  index: number;
  phase: V2Phase;
  updatedAt: string;
  sentAt: string | null;
};

export type DraftStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function draftKey(profileId: string) {
  return `metodologia-v2:${profileId}`;
}

export function readDraft(store: DraftStore, profileId: string): V2Draft | null {
  const raw = store.getItem(draftKey(profileId));
  if (!raw) return null;
  const parsed = JSON.parse(raw) as V2Draft;
  if (!parsed || parsed.instrumentId == null || parsed.answers == null) return null;
  return parsed;
}

export function writeDraft(store: DraftStore, profileId: string, draft: V2Draft) {
  store.setItem(draftKey(profileId), JSON.stringify(draft));
}
