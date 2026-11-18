import { gapZone } from "./readings";
import { choiceLabel, CLUB_TITLES, frictionTitle, SOPHISTICATION_TITLES, titled, topRanks } from "./report-text";
import { techItemScore } from "./sat";
import type { V2Answers, V2Question } from "./types";

export interface V2Friction {
  title: string;
  items: string[];
}

export interface V2NamedChoice {
  title: string;
  label: string;
}

export interface V2Report {
  profile: V2NamedChoice[];
  frictions: V2Friction[];
  gapZone: string | null;
  underuse: { used: number; idle: number; adornment: boolean } | null;
  frontier: { score: number; delta: number; behind: boolean } | null;
  control: { label: string; score: number } | null;
  traceability: { label: string; score: number } | null;
  sophistication: V2NamedChoice[];
  clubs: V2NamedChoice[];
  demand: string | null;
  signals: string[];
}

const PROFILE = [
  ["MOD0-WEB-02", "Tamaño"],
  ["MOD0-WEB-03", "Dónde opera"],
  ["MOD0-WEB-05", "A quién le vende"],
] as const;
function tech(questions: V2Question[], slot: number) {
  return questions.find((question) => question.id.endsWith(`TECH-0${slot}`) || question.id === `TECH-0${slot}`);
}
function scored(question: V2Question | undefined, answers: V2Answers) {
  if (!question) return null;
  const score = techItemScore(question, answers[question.id]);
  const label = choiceLabel(question, answers[question.id]);
  return score !== null && label ? { label, score } : null;
}

export function buildReport(questions: V2Question[], answers: V2Answers, ib: number | null): V2Report {
  const profile = PROFILE.flatMap(([id, title]) => {
    const question = questions.find((item) => item.id === id);
    const label = question ? choiceLabel(question, answers[id]) : null;
    return label ? [{ title, label }] : [];
  });
  const frictions = questions
    .filter((question) => question.type === "rank")
    .map((question) => ({ title: frictionTitle(question), items: topRanks(question, answers[question.id], 3) }))
    .filter((group) => group.items.length > 0);
  const underuseQuestion = tech(questions, 2);
  const underuseScore = underuseQuestion ? techItemScore(underuseQuestion, answers[underuseQuestion.id]) : null;
  const frontierQuestion = tech(questions, 3);
  const frontierScore = frontierQuestion ? techItemScore(frontierQuestion, answers[frontierQuestion.id]) : null;
  const control = scored(tech(questions, 6), answers);
  const traceability = scored(tech(questions, 7), answers);
  const demandQuestion = tech(questions, 5);
  const underuse =
    underuseScore === null
      ? null
      : { used: underuseScore, idle: Math.round((100 - underuseScore) * 100) / 100, adornment: 100 - underuseScore > 40 };
  const frontier =
    frontierScore === null
      ? null
      : { score: frontierScore, delta: Math.round((100 - frontierScore) * 100) / 100, behind: 100 - frontierScore > 50 };
  const signals = [
    underuse?.adornment ? "Capacitar a quien ya tiene el sistema, antes de comprar otro. El subuso pasa de 40." : null,
    frontier?.behind ? "Acercarse a la tecnología que ya usan los líderes del sector. La distancia pasa de 50." : null,
    control && control.score <= 50 ? "Ordenar el control de la operación: hoy se lleva a mano o en hojas sueltas." : null,
    traceability && traceability.score <= 50 ? "Pasar el rastro de papel a un registro que se pueda consultar." : null,
  ].filter((item): item is string => Boolean(item));
  return {
    profile,
    frictions,
    gapZone: ib === null ? null : gapZone(ib),
    underuse,
    frontier,
    control,
    traceability,
    sophistication: titled(questions, answers, /^CP-/, SOPHISTICATION_TITLES),
    clubs: titled(questions, answers, /^COL-/, CLUB_TITLES),
    demand: demandQuestion ? choiceLabel(demandQuestion, answers[demandQuestion.id]) : null,
    signals,
  };
}
