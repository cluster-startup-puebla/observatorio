import { memoryStore, type MemoryStore } from "./store";

export function ensureDeskSeed(state: MemoryStore) {
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

export function seedCompletedAnswers(personId: string, answers: Record<string, string>) {
  memoryStore().answers[personId] = { ...answers };
}
