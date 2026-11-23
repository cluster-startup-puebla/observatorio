import { sessionPublicSlug } from "@/lib/sessions/public-path";

type FormReader = { get(name: string): FormDataEntryValue | null };

export function sessionIdentityFromForm(
  form: FormReader,
  fallback?: { title?: string; session_on?: string },
) {
  const title = String(form.get("title") ?? fallback?.title ?? "").trim();
  const sessionOn = String(form.get("session_on") ?? fallback?.session_on ?? "").trim();
  if (title.length < 2) return { ok: false as const, reason: "Falta el título." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(sessionOn)) return { ok: false as const, reason: "Falta la fecha." };
  const public_slug = sessionPublicSlug(sessionOn, title);
  if (!/^\d{2}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(public_slug)) {
    return { ok: false as const, reason: "No se pudo armar el enlace público." };
  }
  return { ok: true as const, title, public_slug };
}
