"use server";

import { serverIssue } from "@/lib/onboarding/step-issue";
import { stepOneIssue, type StepOne } from "@/lib/registro/step-one";
import { stepTwoIssue, type StepTwo } from "@/lib/registro/step-two";
import { createSupabaseAnon } from "@/lib/supabase/auth-session";

const codes = [
  "nombre",
  "puesto",
  "correo",
  "whatsapp",
  "empresa",
  "mercado",
  "empleados",
  "municipio",
  "sector",
  "referencia",
  "interes",
  "terminos",
];

function sentence(code: string) {
  if (code === "correo") return "Escribe un correo válido.";
  return serverIssue(code);
}

function rpcSentence(message: string | undefined) {
  const text = message?.trim().toLowerCase() ?? "";
  const code = codes.find((item) => text === item || text.endsWith(`: ${item}`));
  return code ? sentence(code) : serverIssue("guardar");
}

export async function startRegistro(input: StepOne & { sectorSlug: string; inviteToken: string }) {
  const issue = stepOneIssue(input);
  if (issue) return { error: sentence(issue) };
  const result = await createSupabaseAnon().rpc("start_public_registration", {
    full_name: input.fullName,
    job_title: input.jobTitle,
    email: input.email,
    whatsapp: input.whatsapp,
    sector_slug: input.sectorSlug,
    invite_token: input.inviteToken,
  });
  if (result.error || typeof result.data !== "string" || !result.data) {
    return { error: rpcSentence(result.error?.message) };
  }
  return { id: result.data };
}

export async function finishRegistro(input: StepTwo & { registrationId: string }) {
  const issue = stepTwoIssue(input);
  if (issue) return { error: sentence(issue) };
  const result = await createSupabaseAnon().rpc("finish_public_registration", {
    registration_id: input.registrationId,
    company_name: input.companyName,
    market_size: input.marketSize,
    employee_band: input.employeeBand,
    municipality: input.municipality,
    sector_slug: input.sectorSlug,
    referral_source: input.referralSource,
    session_interest: input.sessionInterest,
  });
  if (result.error) return { error: rpcSentence(result.error.message) };
  return { ok: true as const };
}
