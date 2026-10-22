import type { SupabaseClient } from "@supabase/supabase-js";
import { landingMessage } from "@/lib/admin/sectores/headline";
import type { AccountRole, Directory } from "./directory";

const notImplemented = async (): Promise<never> => {
  throw new Error("no implementado");
};

export function createSupabaseDirectory(client: SupabaseClient): Directory {
  return {
    createAccount: notImplemented,
    superadminCount: notImplemented,
    createFirstSuperadmin: notImplemented,
    loginSuperadmin: notImplemented,
    loginAccount: notImplemented,
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
    async sectorMessage(slug: string) {
      const sector = await client.from("sectors").select("id").eq("slug", slug).maybeSingle();
      if (sector.error) throw new Error(sector.error.message);
      if (!sector.data) return null;
      const page = await client.from("sector_pages").select("headline, body").eq("sector_id", sector.data.id).maybeSingle();
      if (page.error) throw new Error(page.error.message);
      if (!page.data) return null;
      return landingMessage(page.data);
    },
    attributeRegistration: notImplemented,
    conversion: notImplemented,
    recordOpen: notImplemented,
    opensFor: notImplemented,
    scanQr: notImplemented,
    sendOpenInnovation: notImplemented,
    outbox: notImplemented,
    progress: notImplemented,
    getAccount: notImplemented,
  };
}
