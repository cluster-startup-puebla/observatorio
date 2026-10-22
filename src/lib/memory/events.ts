import type { Directory } from "../directory";
import { openRef, sealRef } from "../ref-token";
import { attributeInStore } from "./attribute-registration";
import { bucket, memoryStore, refSecret } from "./store";

const messages = new Map<string, { headline: string; body: string }>();

export function eventMethods(): Pick<
  Directory,
  | "copyEventLink"
  | "brandForToken"
  | "sectorMessage"
  | "attributeRegistration"
  | "conversion"
  | "recordOpen"
  | "opensFor"
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
      attributeInStore(memoryStore(), input);
    },

    async conversion(orgId, sectorSlug) {
      const key = bucket(orgId, sectorSlug);
      const state = memoryStore();
      return {
        copies: state.copies[key] ?? 0,
        registrations: state.registrations[key] ?? 0,
      };
    },

    async recordOpen(input) {
      const orgId = openRef(input.token, refSecret());
      if (!orgId) return;
      memoryStore().opens.push({ orgId, sectorSlug: input.sectorSlug, at: input.at });
    },

    async opensFor(orgId) {
      return memoryStore()
        .opens.filter((item) => item.orgId === orgId)
        .map((item) => ({ at: item.at, sectorSlug: item.sectorSlug }));
    },
  };
}
