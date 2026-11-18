import { expect, it } from "vitest";
import { draftKey, readDraft, writeDraft, type DraftStore } from "./draft";

function memory(): DraftStore {
  const box = new Map<string, string>();
  return {
    getItem: (key) => box.get(key) ?? null,
    setItem: (key, value) => box.set(key, value),
  };
}

it("guarda y recupera el índice y las respuestas de esa persona", () => {
  const store = memory();
  writeDraft(store, "profile-1", {
    instrumentId: "alimentos",
    answers: { "ED-01": { kind: "single", optionValue: "a" } },
    index: 3,
    phase: "general",
    updatedAt: "2026-11-18T14:00:00.000Z",
    sentAt: null,
  });
  expect(readDraft(store, "profile-1")?.index).toBe(3);
  expect(readDraft(store, "profile-2")).toBeNull();
  expect(draftKey("profile-1")).toBe("metodologia-v2:profile-1");
});
