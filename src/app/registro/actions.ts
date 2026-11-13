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

type Input = StepOne & StepTwo & { inviteToken: string };

export async function submitRegistro(input: Input) {
  const person = stepOneIssue(input);
  if (person) return { error: sentence(person) };
  const company = stepTwoIssue(input);
  if (company) return { error: sentence(company) };
  const supabase = createSupabaseAnon();
  const started = await supabase.rpc("start_public_registration", {
    full_name: input.fullName,
    job_title: input.jobTitle,
    email: input.email,
    whatsapp: input.whatsapp,
    sector_slug: input.sectorSlug,
    invite_token: input.inviteToken,
  });
  if (started.error || typeof started.data !== "string" || !started.data) {
    return { error: rpcSentence(started.error?.message) };
  }
  const finished = await supabase.rpc("finish_public_registration", {
    registration_id: started.data,
    company_name: input.companyName,
    market_size: input.marketSize,
    employee_band: input.employeeBand,
    municipality: input.municipality,
    sector_slug: input.sectorSlug,
    referral_source: input.referralSource,
    session_interest: input.sessionInterest,
  });
  if (finished.error) return { error: rpcSentence(finished.error.message) };
  return { ok: true as const };
}
