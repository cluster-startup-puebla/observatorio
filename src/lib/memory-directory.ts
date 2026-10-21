import { applyCrmEvent, type CrmStatus } from "./crm-status";
import type { AccountRole, CrmPerson, Directory } from "./directory";
import { parseInviteSheet } from "./invite-sheet";
import { openRef, sealRef } from "./ref-token";

type Person = {
  id: string;
  email: string;
  role: AccountRole;
  onboarded: boolean;
  sectorSlug?: string;
  size?: string;
  name?: string;
  logoKey?: string;
  orgId?: string;
  empresa?: string;
  status: CrmStatus | null;
};

type Store = {
  seq: number;
  people: Person[];
  answers: Record<string, Record<string, string>>;
  copies: Record<string, number>;
  registrations: Record<string, number>;
  outbox: { to: string; subject: string }[];
};

const globalKey = "__observatorioDirectory";

function emptyStore(): Store {
  return { seq: 0, people: [], answers: {}, copies: {}, registrations: {}, outbox: [] };
}

function store(): Store {
  const bag = globalThis as typeof globalThis & { [globalKey]?: Store };
  if (!bag[globalKey]) bag[globalKey] = emptyStore();
  return bag[globalKey];
}

function bucket(orgId: string, sectorSlug: string) {
  return `${orgId}:${sectorSlug}`;
}

function refSecret() {
  return process.env.REF_SECRET ?? "e2e-ref-secret";
}

const openInnovationSubject = "¿Quieres ser una empresa de innovación abierta?";

export function resetDirectory() {
  (globalThis as typeof globalThis & { [globalKey]?: Store })[globalKey] = emptyStore();
}

function ensureDeskSeed(state: Store) {
  if (state.people.some((person) => person.id === "persona-registrada")) return;
  state.people.push({
    id: "persona-registrada",
    email: "ana.lopez@mesa.observatorio",
    role: "empresario",
    onboarded: true,
    sectorSlug: "turismo",
    size: "1–10",
    name: "Ana López",
    status: "registrado",
  });
}

function createMemoryDirectory(): Directory {
  return {
    async createAccount(input) {
      const state = store();
      const email = input.email.trim().toLowerCase();
      const existing = state.people.find((person) => person.email === email && !person.orgId);
      if (existing) return { id: existing.id };
      state.seq += 1;
      const id = `p${state.seq}`;
      state.people.push({
        id,
        email,
        role: input.role,
        onboarded: false,
        status: null,
      });
      return { id };
    },

    async findByEmail(email) {
      const person = store().people.find(
        (item) => item.email === email.trim().toLowerCase() && !item.orgId,
      );
      if (!person) return null;
      return { id: person.id, role: person.role, onboarded: person.onboarded };
    },

    async completeOnboarding(id, profile) {
      const person = store().people.find((item) => item.id === id);
      if (!person) return;
      person.onboarded = true;
      person.sectorSlug = profile.sectorSlug;
      person.size = profile.size;
      if (profile.name) person.name = profile.name;
      if (profile.logoKey) person.logoKey = profile.logoKey;
      person.status = "registrado";
    },

    async saveAnswer(input) {
      const state = store();
      const current = state.answers[input.personId] ?? {};
      current[input.questionId] = input.value;
      state.answers[input.personId] = current;
    },

    async answersFor(personId) {
      return { ...(store().answers[personId] ?? {}) };
    },

    async qrFor(id) {
      const person = store().people.find((item) => item.id === id);
      if (!person?.onboarded) return null;
      return { personId: person.id };
    },

    async importInvites(orgId, rows) {
      const parsed = parseInviteSheet([
        ["nombre", "empresa", "correo"],
        ...rows.map((row) => [row.nombre, row.empresa, row.correo]),
      ]);
      const state = store();
      for (const row of parsed.ok) {
        if (state.people.some((person) => person.orgId === orgId && person.email === row.correo)) {
          continue;
        }
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
      }
    },

    async crm(orgId) {
      return store()
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

    async copyEventLink(orgId, sectorSlug) {
      const state = store();
      const key = bucket(orgId, sectorSlug);
      state.copies[key] = (state.copies[key] ?? 0) + 1;
      return sealRef(orgId, refSecret());
    },

    async attributeRegistration(input) {
      const orgId = openRef(input.token, refSecret());
      if (!orgId) return;
      const state = store();
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
      const state = store();
      return {
        copies: state.copies[key] ?? 0,
        registrations: state.registrations[key] ?? 0,
      };
    },

    async scanQr(id) {
      const state = store();
      if (id === "persona-registrada") ensureDeskSeed(state);
      const person = state.people.find((item) => item.id === id);
      if (!person?.onboarded) return { ok: false, reason: "sin qr" };
      const next = applyCrmEvent(person.status, "llegar");
      if (!next.ok) return { ok: false, reason: next.reason };
      person.status = next.status;
      return { ok: true, name: person.name ?? person.email, status: "llego" };
    },

    async sendOpenInnovation() {
      const state = store();
      for (const person of state.people) {
        if (!person.onboarded || person.orgId) continue;
        state.outbox.push({ to: person.email, subject: openInnovationSubject });
      }
    },

    async outbox() {
      return store().outbox.map((mail) => ({ ...mail }));
    },

    async progress() {
      return Object.entries(store().answers).map(([personId, answers]) => ({
        personId,
        count: Object.keys(answers).length,
      }));
    },
  };
}

export function getDirectory(): Directory {
  const mode = process.env.DIRECTORY;
  if (mode && mode !== "memory") {
    throw new Error(`Directory ${mode} todavía no está conectado`);
  }
  return createMemoryDirectory();
}

export function seedCompletedAnswers(personId: string, answers: Record<string, string>) {
  const state = store();
  state.answers[personId] = { ...answers };
}
