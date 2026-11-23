import { registroYaTieneCuentaCode } from "@/lib/registro/registro-login-prompt";
import { submitRegistro } from "./actions";
import { rememberRegistro } from "./registro-memory";

const fallback = "No se pudo guardar. Revisa los datos e intenta de nuevo.";

type Values = {
  fullName: string;
  jobTitle: string;
  email: string;
  whatsapp: string;
  companyName: string;
  marketSize: string;
  employeeBand: string;
  municipality: string;
  sectorSlug: string;
  referralSource: string;
  sessionInterest: string;
};

export async function runRegistroSubmit(input: {
  values: Values;
  sector: string;
  invitacion: string;
  sessionId: string;
  lockedReferral?: string | null;
  terms: boolean;
}) {
  try {
    const result = await submitRegistro({
      ...input.values,
      referralSource: input.lockedReferral || input.values.referralSource,
      sectorSlug: input.sector || input.values.sectorSlug,
      inviteToken: input.invitacion,
      sessionId: input.sessionId,
      terms: input.terms,
    });
    if ("code" in result && result.code === registroYaTieneCuentaCode) return { yaTieneCuenta: true as const };
    if ("error" in result) return { error: result.error ?? fallback };
    rememberRegistro();
    return { done: true as const };
  } catch {
    return { error: fallback };
  }
}