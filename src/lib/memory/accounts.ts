import { applyCrmEvent } from "../crm-status";
import type { Directory } from "../directory";
import { memoryStore } from "./store";

function accountByPassword(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  return memoryStore().people.find(
    (item) => item.email === email && !item.orgId && item.password === input.password,
  );
}

export function accountMethods(): Pick<
  Directory,
  | "createAccount"
  | "superadminCount"
  | "createFirstSuperadmin"
  | "loginSuperadmin"
  | "loginAccount"
  | "findByEmail"
> {
  return {
    async createAccount(input) {
      const state = memoryStore();
      const email = input.email.trim().toLowerCase();
      let account = state.people.find((person) => person.email === email && !person.orgId);
      if (!account) {
        state.seq += 1;
        account = {
          id: `p${state.seq}`,
          email,
          role: input.role,
          onboarded: false,
          status: null,
        };
        state.people.push(account);
      }
      for (const person of state.people) {
        if (!person.orgId || person.email.trim().toLowerCase() !== email) continue;
        const next = applyCrmEvent(person.status, "confirmar");
        if (next.ok) person.status = next.status;
      }
      return { id: account.id };
    },

    async superadminCount() {
      return memoryStore().people.filter((person) => person.role === "superadmin" && !person.orgId).length;
    },

    async createFirstSuperadmin(input) {
      const state = memoryStore();
      if (state.people.some((person) => person.role === "superadmin" && !person.orgId)) {
        return { ok: false as const, reason: "ya existe" as const };
      }
      const email = input.email.trim().toLowerCase();
      state.seq += 1;
      state.people.push({
        id: `p${state.seq}`,
        email,
        role: "superadmin",
        onboarded: true,
        password: input.password,
        status: null,
      });
      return { ok: true as const, id: `p${state.seq}` };
    },

    async loginAccount(input) {
      const person = accountByPassword(input);
      if (!person) return { ok: false as const, reason: "credenciales" as const };
      return { ok: true as const, id: person.id, role: person.role };
    },

    async loginSuperadmin(input) {
      const person = accountByPassword(input);
      if (!person || person.role !== "superadmin") {
        return { ok: false as const, reason: "credenciales" as const };
      }
      return { ok: true as const, id: person.id };
    },

    async findByEmail(email) {
      const person = memoryStore().people.find(
        (item) => item.email === email.trim().toLowerCase() && !item.orgId,
      );
      if (!person) return null;
      return { id: person.id, role: person.role, onboarded: person.onboarded };
    },
  };
}
