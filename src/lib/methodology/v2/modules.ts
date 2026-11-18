import type { V2Question } from "./types";

const MODULES: { test: RegExp; number: number; n1: string; n2: string }[] = [
  { test: /MÓDULO 0/i, number: 0, n1: "Perfil", n2: "Perfil" },
  { test: /SECCIÓN I\b/i, number: 1, n1: "Entorno", n2: "Rompehielos" },
  { test: /SECCIÓN II\b/i, number: 2, n1: "Innovación", n2: "Auditoría" },
  { test: /SECCIÓN III\b/i, number: 3, n1: "Tracción", n2: "Sofisticación" },
  { test: /SECCIÓN IV\b/i, number: 4, n1: "Rompehielos", n2: "Bienes de club" },
];

export function moduleOf(section: string, level: "n1" | "n2") {
  const found = MODULES.find((item) => item.test.test(section)) ?? MODULES[0];
  const name = level === "n1" ? found.n1 : found.n2;
  return { number: found.number, label: `Módulo ${found.number}. ${name}` };
}

export function modulePlace(questions: V2Question[], index: number) {
  const question = questions[index];
  if (!question) return { label: "", meta: "", progress: 100 };
  const level = question.level;
  const module = moduleOf(question.section, level);
  const inLevel = questions.filter((item) => item.level === level);
  const inModule = inLevel.filter((item) => moduleOf(item.section, level).number === module.number);
  const position = inLevel.findIndex((item) => item.id === question.id) + 1;
  const within = inModule.findIndex((item) => item.id === question.id) + 1;
  const progress = inLevel.length === 0 ? 0 : (position / inLevel.length) * 100;
  return { label: module.label, meta: `${within}/${inModule.length}`, progress };
}
