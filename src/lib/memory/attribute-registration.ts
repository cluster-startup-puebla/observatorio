import { openRef } from "../ref-token";
import { bucket, refSecret, type MemoryStore } from "./store";

export function attributeInStore(
  state: MemoryStore,
  input: { token: string; email: string; sectorSlug?: string },
) {
  const orgId = openRef(input.token, refSecret());
  if (!orgId) return;
  const email = input.email.trim().toLowerCase();
  if (!email) return;
  const key = input.sectorSlug
    ? bucket(orgId, input.sectorSlug)
    : Object.keys(state.copies).find((item) => item.startsWith(`${orgId}:`));
  if (!key) return;
  if (!state.attributed) state.attributed = [];
  const stamp = `${key}:${email}`;
  if (state.attributed.includes(stamp)) return;
  state.attributed.push(stamp);
  state.registrations[key] = (state.registrations[key] ?? 0) + 1;
  if (state.people.some((person) => person.orgId === orgId && person.email === email)) return;
  state.people.push({
    id: `reg-${email}`,
    email,
    role: "empresario",
    onboarded: false,
    orgId,
    status: "registrado",
  });
}
