import type { Directory } from "../directory";
import { openRef, sealRef } from "../ref-token";
import { bucket, memoryStore, refSecret } from "./store";

const messages = new Map<string, { headline: string; body: string }>();

export function eventMethods(): Pick<
  Directory,
  "copyEventLink" | "brandForToken" | "sectorMessage" | "attributeRegistration" | "conversion"
> {
  return {
    async copyEventLink(orgId, sectorSlug) {
      const state = memoryStore();
      const key = bucket(orgId, sectorSlug);
      state.copies[key] = (state.copies[key] ?? 0) + 1;
      return sealRef(orgId, refSecret());
    },

    async brandForToken(token) {
      const orgId = openRef(token, refSecret());
      if (!orgId) return null;
      const account = memoryStore().people.find((item) => item.id === orgId && !item.orgId);
      if (!account?.name || !account.logoKey) return null;
      return { name: account.name, logoKey: account.logoKey };
    },

    async sectorMessage(slug: string) {
      return messages.get(slug) ?? null;
    },

    async attributeRegistration(input) {
      const orgId = openRef(input.token, refSecret());
      if (!orgId) return;
      const state = memoryStore();
      const key = Object.keys(state.copies).find((item) => item.startsWith(`${orgId}:`));
      if (!key) return;
      state.registrations[key] = (state.registrations[key] ?? 0) + 1;
      state.people.push({
        id: `reg-${input.email}`,
        email: input.email.trim().toLowerCase(),
        role: "empresario",
        onboarded: false,
        orgId,
        status: "registrado",
      });
    },

    async conversion(orgId, sectorSlug) {
      const key = bucket(orgId, sectorSlug);
      const state = memoryStore();
      return {
        copies: state.copies[key] ?? 0,
        registrations: state.registrations[key] ?? 0,
      };
    },
  };
}
