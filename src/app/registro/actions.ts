"use server";

import { serverIssue } from "@/lib/onboarding/step-issue";
import { inviteReferralSource } from "@/lib/registro/invite-referral";
import { stepOneIssue, type StepOne } from "@/lib/registro/step-one";
import { stepTwoIssue, type StepTwo } from "@/lib/registro/step-two";
import { attributeRsvpInvite } from "@/lib/registro/rsvp-invite-attribute";
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
  "sesion",
];

function sentence(code: string) {
  if (code === "correo") return "Escribe un correo válido.";
  if (code === "sesion") return "No encontramos la sesión de este registro.";
  return serverIssue(code);
}

function rpcSentence(message: string | undefined) {
  const text = message?.trim().toLowerCase() ?? "";
  const code = codes.find((item) => text === item || text.endsWith(`: ${item}`));
  return code ? sentence(code) : serverIssue("guardar");
}

type Input = StepOne & StepTwo & { inviteToken: string; sessionId: string };

export async function submitRegistro(input: Input) {
  const lockedReferral = await inviteReferralSource(input.inviteToken);
  const payload = {
    ...input,
    referralSource: lockedReferral || input.referralSource,
  };
  const person = stepOneIssue(payload);
  if (person) return { error: sentence(person) };
  const company = stepTwoIssue(payload);
  if (company) return { error: sentence(company) };
  if (!payload.sessionId.trim()) return { error: sentence("sesion") };
  const supabase = createSupabaseAnon();
  const started = await supabase.rpc("start_public_registration", {
    full_name: payload.fullName,
    job_title: payload.jobTitle,
    email: payload.email,
    whatsapp: payload.whatsapp,
    sector_slug: payload.sectorSlug,
    invite_token: payload.inviteToken,
    p_session_id: payload.sessionId,
  });
  if (started.error || typeof started.data !== "string" || !started.data) {
    return { error: rpcSentence(started.error?.message) };
  }
  const finished = await supabase.rpc("finish_public_registration", {
    registration_id: started.data,
    company_name: payload.companyName,
    market_size: payload.marketSize,
    employee_band: payload.employeeBand,
    municipality: payload.municipality,
    sector_slug: payload.sectorSlug,
    referral_source: payload.referralSource,
    session_interest: payload.sessionInterest,
  });
  if (finished.error) return { error: rpcSentence(finished.error.message) };
  const synced = await supabase.rpc("sync_public_registration_rsvp", {
    p_registration_id: started.data,
  });
  if (synced.error) console.error("sync_public_registration_rsvp", synced.error.message);
  if (payload.inviteToken.trim()) {
    await attributeRsvpInvite(supabase, started.data, payload.inviteToken);
  }
  return { ok: true as const };
}
