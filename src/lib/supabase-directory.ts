import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccountRole, Directory } from "./directory";

const notImplemented = async (): Promise<never> => {
  throw new Error("no implementado");
};

export function createSupabaseDirectory(client: SupabaseClient): Directory {
  return {
    createAccount: notImplemented,
    async findByEmail(email) {
      const normalized = email.trim().toLowerCase();
      const { data } = await client
        .from("profiles")
        .select("id, role, onboarded_at")
        .eq("email", normalized)
        .maybeSingle();
      if (!data) return null;
      return {
        id: data.id,
        role: data.role as AccountRole,
        onboarded: Boolean(data.onboarded_at),
      };
    },
    completeOnboarding: notImplemented,
    saveAnswer: notImplemented,
    answersFor: notImplemented,
    qrFor: notImplemented,
    importInvites: notImplemented,
    crm: notImplemented,
    applyCrm: notImplemented,
    copyEventLink: notImplemented,
    brandForToken: notImplemented,
    sectorMessage: notImplemented,
    attributeRegistration: notImplemented,
    conversion: notImplemented,
    scanQr: notImplemented,
    sendOpenInnovation: notImplemented,
    outbox: notImplemented,
    progress: notImplemented,
    getAccount: notImplemented,
  };
}
