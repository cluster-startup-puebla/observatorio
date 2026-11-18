import type { V2Band } from "@/lib/methodology/v2/bands";
import type { V2Draft } from "@/lib/methodology/v2/draft";

export type DoneFlush = (
  draft: V2Draft,
  entering: "done",
  score?: { ismsNivel2: number; band: V2Band | null },
) => Promise<boolean>;

export function flushDone(
  scheduleFlush: DoneFlush | undefined,
  draft: V2Draft,
  note: number | null,
  band: V2Band | null,
) {
  if (!scheduleFlush) return Promise.resolve(true);
  if (note === null) return scheduleFlush(draft, "done");
  return scheduleFlush({ ...draft, phase: "done" }, "done", { ismsNivel2: note, band });
}
