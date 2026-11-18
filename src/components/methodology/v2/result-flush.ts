import type { V2Band } from "@/lib/methodology/v2/bands";
import type { V2Draft } from "@/lib/methodology/v2/draft";

export type DoneFlush = (
  draft: V2Draft,
  entering: "done",
  score?: { ismsNivel2: number; band: V2Band | null },
) => void;

export function flushDone(
  scheduleFlush: DoneFlush | undefined,
  draft: V2Draft,
  note: number | null,
  band: V2Band | null,
) {
  if (!scheduleFlush) return;
  if (note === null) {
    scheduleFlush(draft, "done");
    return;
  }
  scheduleFlush({ ...draft, phase: "done" }, "done", { ismsNivel2: note, band });
}
