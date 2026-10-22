import { applyCrmEvent } from "../crm-status";
import type { CrmPerson, Directory } from "../directory";
import { parseInviteSheet } from "../invite-sheet";
import { mailFor } from "../outbox-message";
import { memoryStore } from "./store";

export function crmMethods(): Pick<Directory, "importInvites" | "crm" | "applyCrm"> {
  return {
    async importInvites(orgId, rows) {
      const parsed = parseInviteSheet([
        ["nombre", "empresa", "correo"],
        ...rows.map((row) => [row.nombre, row.empresa, row.correo]),
      ]);
      const state = memoryStore();
      for (const row of parsed.ok) {
        if (state.people.some((person) => person.orgId === orgId && person.email === row.correo)) continue;
        const opened = applyCrmEvent(null, "cargar");
        if (!opened.ok) continue;
        state.seq += 1;
        state.people.push({
          id: `p${state.seq}`,
          email: row.correo,
          role: "empresario",
          onboarded: false,
          orgId,
          name: row.nombre,
          empresa: row.empresa,
          status: opened.status,
        });
        const { to, subject } = mailFor("password", row.correo);
        state.outbox.push({ to, subject });
      }
    },

    async crm(orgId) {
      return memoryStore()
        .people.filter((person) => person.orgId === orgId)
        .map(
          (person): CrmPerson => ({
            id: person.id,
            nombre: person.name ?? "",
            empresa: person.empresa ?? "",
            correo: person.email,
            status: person.status ?? "",
          }),
        );
    },

    async applyCrm(personId, event) {
      const person = memoryStore().people.find((item) => item.id === personId);
      if (!person) return { ok: false as const, reason: "transición inválida" };
      const next = applyCrmEvent(person.status, event);
      if (!next.ok) return { ok: false as const, reason: next.reason };
      if (next.status !== "contactado" && next.status !== "no") {
        return { ok: false as const, reason: "transición inválida" };
      }
      person.status = next.status;
      return { ok: true as const, status: next.status };
    },
  };
}
