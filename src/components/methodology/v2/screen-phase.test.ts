import { expect, it } from "vitest";
import { draftKey, type V2Draft } from "@/lib/methodology/v2/draft";
import { openSavedDraft } from "./screen-phase";

function draft(patch: Partial<V2Draft>): V2Draft {
  return {
    instrumentId: "automotriz",
    answers: { a: { kind: "single", optionValue: "1" } },
    index: 2,
    phase: "general",
    updatedAt: "2026-11-20T00:00:00.000Z",
    sentAt: null,
    ...patch,
  };
}

function store(saved: V2Draft | null) {
  const items = new Map<string, string>();
  if (saved) items.set(draftKey("test"), JSON.stringify(saved));
  return {
    items,
    getItem(key: string) {
      return items.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      items.set(key, value);
    },
    removeItem(key: string) {
      items.delete(key);
    },
  };
}

const packs = [{ id: "automotriz", questions: Array.from({ length: 4 }) }];

it("borra el cierre local si el servidor no tiene la evaluación", () => {
  const memory = store(draft({ phase: "done", index: 4 }));
  const next = openSavedDraft(memory, "test", null, packs);
  expect(next).toBeNull();
  expect(memory.getItem(draftKey("test"))).toBeNull();
});

it("conserva el formulario a medias", () => {
  const saved = draft({ index: 1 });
  const memory = store(saved);
  const next = openSavedDraft(memory, "test", null, packs);
  expect(next?.index).toBe(1);
  expect(memory.getItem(draftKey("test"))).toContain("automotriz");
});
