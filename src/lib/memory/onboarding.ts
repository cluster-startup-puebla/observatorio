import { applyCrmEvent } from "../crm-status";
import type { Directory } from "../directory";
import { mailFor } from "../outbox-message";
import { memoryStore } from "./store";

export function onboardingMethods(): Pick<Directory, "completeOnboarding" | "getAccount"> {
  return {
    async completeOnboarding(id, profile) {
      const state = memoryStore();
      const person = state.people.find((item) => item.id === id);
      if (!person) return;
      person.onboarded = true;
      person.sectorSlug = profile.sectorSlug;
      person.size = profile.size;
      if (profile.name) person.name = profile.name;
      if (profile.logoKey) person.logoKey = profile.logoKey;
      person.status = "registrado";
      const email = person.email.trim().toLowerCase();
      for (const row of state.people) {
        if (!row.orgId || row.email.trim().toLowerCase() !== email) continue;
        if (row.status !== "confirmo") continue;
        const next = applyCrmEvent(row.status, "registrar");
        if (next.ok) row.status = next.status;
      }
      if (person.role === "empresario") {
        const { to, subject } = mailFor("event_pass", person.email);
        state.outbox.push({ to, subject });
      }
    },

    async getAccount(id) {
      const person = memoryStore().people.find((item) => item.id === id && !item.orgId);
      if (!person) return null;
      return {
        id: person.id,
        email: person.email,
        role: person.role,
        onboarded: person.onboarded,
        sectorSlug: person.sectorSlug,
        name: person.name,
        logoKey: person.logoKey,
      };
    },
  };
}
