import { scoreV2, type V2Score } from "./score";
import type { V2Answers, V2Question } from "./types";
import type { V2ExampleCase } from "./example-cases";

export type { V2ExampleCase } from "./example-cases";
export { V2_EXAMPLES } from "./example-cases";

const SAT_IDS = ["P1", "P2", "P3", "P4", "P5", "TECH-06", "TECH-07"];

/**
 * Replays an example through scoreV2 using synthetic questions: each item has a single
 * option whose score is the ficha value. P5 is answered with free text so its 60 comes
 * from the scorer's constant, not from an option score.
 */
export function scoreExample(example: V2ExampleCase): V2Score {
  const items: Array<{ id: string; score: number; text?: boolean }> = [
    ...example.ed.map((score, i) => ({ id: `ED-0${i + 1}`, score })),
    ...example.ino.map((score, i) => ({ id: `INO-0${i + 1}`, score })),
    ...example.com.map((score, i) => ({ id: `COM-0${i + 1}`, score })),
    ...SAT_IDS.map((id, i) => ({ id, score: example.sat[i], text: id === "P5" })),
  ];
  const questions: V2Question[] = items.map((item) => ({
    id: item.id,
    level: /^(ED|INO|COM)-/.test(item.id) ? "n1" : "n2",
    sectorId: null,
    section: "example",
    widget: "example",
    title: item.id,
    prompt: item.id,
    microcopy: null,
    type: item.text ? "single_select_text" : "single_select",
    prefilled: false,
    options: [{ value: `${item.id}-opt`, label: item.id, score: item.score }],
  }));
  const answers: V2Answers = {};
  for (const item of items) {
    answers[item.id] = item.text
      ? { kind: "text", optionValue: `${item.id}-opt`, text: "respuesta libre" }
      : { kind: "single", optionValue: `${item.id}-opt` };
  }
  return scoreV2(questions, answers);
}
