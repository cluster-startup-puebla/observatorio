import type { V2Phase } from "./draft";

export type FlushReason = "start" | "curtain" | "done" | "retry";

export function flushPlan(input: {
  phase: V2Phase;
  answerCount: number;
  pending: boolean;
  online: boolean;
  entering: "answer" | "curtain" | "done" | "online";
}): FlushReason | null {
  if (!input.online) return null;
  // Closing must always POST: a prior sector flush can clear pending.
  if (input.entering === "done") return "done";
  if (!input.pending) return null;
  if (input.entering === "online") return "retry";
  if (input.entering === "curtain") return "curtain";
  if (input.entering === "answer" && input.answerCount === 1) return "start";
  return null;
}
