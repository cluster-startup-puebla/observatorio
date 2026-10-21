import {
  ANSWER_POINTS,
  INTEGRAL_PROFILES,
  INTEGRAL_RANGES,
  PRIORITY_SEVERITY,
  SECTION_PROFILES,
  SECTION_RANGES,
  SECTIONS,
  type Level,
} from "./instrument";

export type AnswerValue = string | Record<string, number>;

export type SectionResult = {
  sectionId: string;
  sectionName: string;
  score: number;
  maxScore: number;
  category: Level | "Sin categoría";
  riesgo: string;
  reto: string;
};

export type IntegralResult = {
  sections: SectionResult[];
  totalScore: number;
  maxScore: 108;
  category: Level | "Sin categoría";
  riesgo: string;
  reto: string;
};

function band(score: number, ranges: { min: number; max: number; category: Level }[]) {
  return ranges.find((range) => score >= range.min && score <= range.max)?.category ?? "Sin categoría";
}

function profile(category: Level | "Sin categoría", source: Record<Level, { riesgo: string; reto: string }>) {
  if (category === "Sin categoría") return { riesgo: "", reto: "" };
  return source[category];
}

function questionScore(value: AnswerValue | undefined, type: "single" | "priority"): number {
  if (type === "priority") {
    if (!value || typeof value === "string") return 0;
    const top = Object.entries(value).find(([, rank]) => rank === 1)?.[0];
    if (!top || !(top in PRIORITY_SEVERITY)) return 0;
    return PRIORITY_SEVERITY[top as keyof typeof PRIORITY_SEVERITY];
  }
  if (typeof value !== "string" || !(value in ANSWER_POINTS)) return 0;
  return ANSWER_POINTS[value as keyof typeof ANSWER_POINTS];
}

export function answersFromStored(raw: Record<string, string>): Record<number, AnswerValue> {
  const answers: Record<number, AnswerValue> = {};
  for (const [id, value] of Object.entries(raw)) {
    if (value.startsWith("{")) {
      try {
        const parsed = JSON.parse(value) as Record<string, number>;
        if (parsed && typeof parsed === "object") {
          answers[Number(id)] = parsed;
          continue;
        }
      } catch {
        answers[Number(id)] = value;
        continue;
      }
    }
    answers[Number(id)] = value;
  }
  return answers;
}

export function calculateIntegralResult(answers: Record<number, AnswerValue>): IntegralResult {
  const sections: SectionResult[] = SECTIONS.map((section) => {
    const score = section.questions.reduce(
      (total, question) => total + questionScore(answers[question.id], question.type),
      0,
    );
    const maxScore = section.questions.length * ANSWER_POINTS.d;
    const category = band(score, SECTION_RANGES[section.id]);
    const copy = profile(category, SECTION_PROFILES[section.id]);
    return {
      sectionId: section.id,
      sectionName: section.name,
      score,
      maxScore,
      category,
      riesgo: copy.riesgo,
      reto: copy.reto,
    };
  });
  const totalScore = sections.reduce((total, section) => total + section.score, 0);
  const category = band(totalScore, INTEGRAL_RANGES);
  const copy = profile(category, INTEGRAL_PROFILES);
  return {
    sections,
    totalScore,
    maxScore: 108,
    category,
    riesgo: copy.riesgo,
    reto: copy.reto,
  };
}
