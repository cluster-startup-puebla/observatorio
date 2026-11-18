import type { V2Answers, V2Question } from "./types";

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

interface Item {
  id: string;
  score: number | null;
  kind?: "single" | "text";
}

function question(item: Item, level: "n1" | "n2"): V2Question {
  return {
    id: item.id,
    level,
    sectorId: null,
    section: "test",
    widget: "test",
    title: item.id,
    prompt: item.id,
    microcopy: null,
    type: item.kind === "text" ? "single_select_text" : level === "n1" ? "likert_5" : "single_select",
    prefilled: false,
    options: [{ value: `${item.id}-opt`, label: item.id, score: item.score }],
  };
}

function build(
  items: Item[],
  levelOf: (id: string) => "n1" | "n2" = (id) => (/^(ED|INO|COM)-/.test(id) ? "n1" : "n2"),
) {
  const questions = items.map((item) => question(item, levelOf(item.id)));
  const answers: V2Answers = {};
  for (const item of items) {
    answers[item.id] =
      item.kind === "text"
        ? { kind: "text", optionValue: `${item.id}-opt`, text: "respuesta libre" }
        : { kind: "single", optionValue: `${item.id}-opt` };
  }
  return { questions, answers };
}

export function fixture(opts: { ed: number[]; ino: number[]; com: number[]; sat: number[]; p5Text?: boolean }) {
  const items: Item[] = [];
  opts.ed.forEach((s, i) => items.push({ id: `ED-0${i + 1}`, score: s }));
  opts.ino.forEach((s, i) => items.push({ id: `INO-0${i + 1}`, score: s }));
  opts.com.forEach((s, i) => items.push({ id: `COM-0${i + 1}`, score: s }));
  const satIds = ["P1", "P2", "P3", "P4", "P5", "TECH-06", "TECH-07"];
  satIds.forEach((id, i) => {
    if (id === "P5" && opts.p5Text) {
      // The option score (20) is deliberately NOT 60: the 60 must come from the text-answer constant.
      items.push({ id, score: 20, kind: "text" });
    } else {
      items.push({ id, score: opts.sat[i] });
    }
  });
  return build(items);
}
