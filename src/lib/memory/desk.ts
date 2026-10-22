import { applyCrmEvent } from "../crm-status";
import type { Directory } from "../directory";
import { mailFor } from "../outbox-message";
import { ensureDeskSeed } from "./desk-seed";
import { memoryStore } from "./store";

export function deskMethods(): Pick<
  Directory,
  "saveAnswer" | "answersFor" | "qrFor" | "scanQr" | "sendOpenInnovation" | "outbox" | "progress"
> {
  return {
    async saveAnswer(input) {
      const state = memoryStore();
      const current = state.answers[input.personId] ?? {};
      current[input.questionId] = input.value;
      state.answers[input.personId] = current;
    },

    async answersFor(personId) {
      return { ...(memoryStore().answers[personId] ?? {}) };
    },

    async qrFor(id) {
      const person = memoryStore().people.find((item) => item.id === id);
      if (!person?.onboarded) return null;
      return { personId: person.id };
    },

    async scanQr(id) {
      const state = memoryStore();
      if (id === "persona-registrada") ensureDeskSeed(state);
      const person = state.people.find((item) => item.id === id);
      if (!person?.onboarded) return { ok: false, reason: "sin qr" };
      const next = applyCrmEvent(person.status, "llegar");
      if (!next.ok) return { ok: false, reason: next.reason };
      person.status = next.status;
      return { ok: true, name: person.name ?? person.email, status: "llego" };
    },

    async sendOpenInnovation() {
      const state = memoryStore();
      for (const person of state.people) {
        if (!person.onboarded || person.orgId) continue;
        const { to, subject } = mailFor("open_innovation", person.email);
        state.outbox.push({ to, subject });
      }
    },

    async outbox() {
      return memoryStore().outbox.map((mail) => ({ ...mail }));
    },

    async progress() {
      return Object.entries(memoryStore().answers).map(([personId, answers]) => ({
        personId,
        count: Object.keys(answers).length,
      }));
    },
  };
}
