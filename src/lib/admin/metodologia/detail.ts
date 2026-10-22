import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { levelFromChoices } from "./level";

export async function loadSeccion(id: string) {
  const db = await adminDb();
  if (!db) return null;
  const section = await db.from("instrument_sections").select("id, name, position, range_kind").eq("id", id).maybeSingle();
  if (section.error) throw new Error(section.error.message);
  if (!section.data) return null;
  const questions = await db.from("questions").select("id, position, prompt, kind").eq("section_id", id).order("position");
  if (questions.error) throw new Error(questions.error.message);
  const ids = (questions.data ?? []).map((row) => row.id);
  const [bands, options, conditions, choices] = await Promise.all([
    db.from("section_bands").select("level, min_score, max_score, riesgo, reto").eq("section_id", id),
    ids.length ? db.from("question_options").select("question_id, value, label, position, points, severity").in("question_id", ids) : Promise.resolve({ data: [], error: null }),
    ids.length ? db.from("question_conditions").select("question_id, depends_on_question_id, expected_value").in("question_id", ids) : Promise.resolve({ data: [], error: null }),
    ids.length ? db.from("response_choices").select("profile_id, question_id, option_value, rank").in("question_id", ids) : Promise.resolve({ data: [], error: null }),
  ]);
  for (const result of [bands, options, conditions, choices]) {
    if (result.error) throw new Error(result.error.message);
  }
  return {
    section: section.data,
    bands: bands.data ?? [],
    questions: questions.data ?? [],
    options: options.data ?? [],
    conditions: conditions.data ?? [],
    level: levelFromChoices(choices.data ?? []),
  };
}
