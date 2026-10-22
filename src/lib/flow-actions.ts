"use server";

import { redirect } from "next/navigation";
import { getDirectory } from "./memory-directory";
import { saveWithRetry } from "./save-answer";

export async function saveMethodologyAnswer(personId: string, questionId: string, value: string) {
  if (!personId || !questionId) return;
  await getDirectory().saveAnswer({ personId, questionId, value });
}

export async function saveMethodologyForm(formData: FormData) {
  const persona = String(formData.get("persona") ?? "").trim();
  const questionId = String(formData.get("pregunta") ?? "").trim();
  const value = String(formData.get("valor") ?? "").trim();
  if (persona && questionId && value) {
    const result = await saveWithRetry(
      (input) => getDirectory().saveAnswer(input),
      { personId: persona, questionId, value },
    );
    const next = String(Math.min(Number(questionId) + 1, 18));
    const query = new URLSearchParams({ persona });
    query.set("pregunta", result.ok ? next : questionId);
    if (!result.ok) query.set("error", "guardar");
    redirect(`/metodologia?${query.toString()}`);
  }
  const query = new URLSearchParams();
  if (persona) query.set("persona", persona);
  redirect(query.size ? `/metodologia?${query.toString()}` : "/metodologia");
}

export async function sendInnovationAction() {
  const { ensureMesaSeed, getDirectory } = await import("./memory-directory");
  ensureMesaSeed();
  const directory = getDirectory();
  await directory.sendOpenInnovation();
  redirect("/admin/correo?enviado=1");
}

export async function scanDeskAction(formData: FormData) {
  const code = String(formData.get("codigo") ?? "").trim();
  if (!code) redirect("/mesa?error=Escribe%20el%20c%C3%B3digo%20del%20QR.");
  const result = await getDirectory().scanQr(code);
  const query = new URLSearchParams({ codigo: code });
  if (!result.ok) {
    query.set("error", result.reason);
    redirect(`/mesa?${query.toString()}`);
  }
  query.set("nombre", result.name);
  query.set("estatus", "llego");
  redirect(`/mesa?${query.toString()}`);
}
