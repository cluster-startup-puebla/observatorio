export type RegisteredPerson = {
  id: string;
  email: string;
  onboarded: boolean;
  arrived: boolean;
};

export type BroadcastKind = "open_innovation" | "reminder" | "thanks";

export function isBroadcastKind(value: string | null): value is BroadcastKind {
  return value === "open_innovation" || value === "reminder" || value === "thanks";
}

export function broadcastAudience(kind: BroadcastKind, people: RegisteredPerson[]) {
  return people.filter((person) => {
    if (!person.email) return false;
    if (kind === "thanks") return person.arrived;
    if (!person.onboarded) return false;
    if (kind === "reminder") return !person.arrived;
    return true;
  });
}
