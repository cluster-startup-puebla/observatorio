import { stepGroups } from "@/lib/methodology/v2/step-groups";

export type EvaluationAction = {
  place: "signal" | "plain" | "company" | "region";
  text: string;
};

export type EvaluationTrace = {
  finishedAt: string | null;
  instrumentId: string;
  band: string | null;
  ismsNivel2: number | null;
  actions: EvaluationAction[];
};

export function evaluationTrace(input: {
  finishedAt: string | null;
  instrumentId: string;
  band: string | null;
  ismsNivel2: number | null;
  actions: string[];
  signals: string[];
}): EvaluationTrace {
  const groups = stepGroups(input.actions);
  const actions: EvaluationAction[] = [
    ...input.signals.map((text) => ({ place: "signal" as const, text })),
    ...groups.plain.map((text) => ({ place: "plain" as const, text })),
    ...groups.own.map((text) => ({ place: "company" as const, text })),
    ...groups.shared.map((text) => ({ place: "region" as const, text })),
  ];
  return {
    finishedAt: input.finishedAt,
    instrumentId: input.instrumentId,
    band: input.band,
    ismsNivel2: input.ismsNivel2,
    actions,
  };
}
