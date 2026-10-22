import "server-only";

import { adminDb } from "@/lib/admin/admin-db";
import { rangeKind } from "./range-kind";

export async function saveSection(id: string, form: FormData) {
  const db = await adminDb();
  if (!db) return { ok: false as const, reason: "sin sesión" };
  const accion = String(form.get("accion") ?? "");
  if (accion === "seccion") {
    const kind = rangeKind(String(form.get("range_kind") ?? ""));
    if (!kind) return { ok: false as const, reason: "rango inválido" };
    const saved = await db.from("instrument_sections").update({
      name: String(form.get("name") ?? ""),
      range_kind: kind,
    }).eq("id", id);
    if (saved.error) return { ok: false as const, reason: saved.error.message };
  }
  if (accion === "pregunta") {
    const saved = await db.from("questions").update({ prompt: String(form.get("prompt") ?? "") }).eq("id", Number(form.get("question_id"))).eq("section_id", id);
    if (saved.error) return { ok: false as const, reason: saved.error.message };
  }
  if (accion === "opcion") {
    const saved = await db.from("question_options").update({
      label: String(form.get("label") ?? ""),
      points: form.get("points") ? Number(form.get("points")) : null,
      severity: form.get("severity") ? Number(form.get("severity")) : null,
    }).eq("question_id", Number(form.get("question_id"))).eq("value", String(form.get("value") ?? ""));
    if (saved.error) return { ok: false as const, reason: saved.error.message };
  }
  if (accion === "banda") {
    const saved = await db.from("section_bands").update({
      min_score: Number(form.get("min_score")),
      max_score: Number(form.get("max_score")),
      riesgo: String(form.get("riesgo") ?? ""),
      reto: String(form.get("reto") ?? ""),
    }).eq("section_id", id).eq("level", String(form.get("level") ?? ""));
    if (saved.error) return { ok: false as const, reason: saved.error.message };
  }
  if (accion === "condicion") {
    const saved = await db.from("question_conditions").insert({
      question_id: Number(form.get("question_id")),
      depends_on_question_id: Number(form.get("depends_on_question_id")),
      expected_value: String(form.get("expected_value") ?? ""),
    });
    if (saved.error) return { ok: false as const, reason: saved.error.message };
  }
  return { ok: true as const };
}
