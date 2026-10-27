import { sectorPace } from "./sector-pace";

export type SeatPerson = {
  id: string;
  sector: string;
  orgId: string | null;
  onboarded: boolean;
  accepted: boolean;
  cancelled: boolean;
};

export type SeatQuota = { sector: string; capacity: number | null };

function occupies(person: SeatPerson, sector: string) {
  return person.sector === sector && person.onboarded && person.accepted && !person.cancelled;
}

export function paceFor(people: SeatPerson[], quota: SeatQuota, orgId: string) {
  const seats = people.filter((person) => occupies(person, quota.sector));
  const mine = seats.filter((person) => person.orgId === orgId).length;
  return sectorPace({ capacity: quota.capacity, mine, others: seats.length - mine });
}

export function acceptSeat(people: SeatPerson[], quota: SeatQuota, id: string) {
  const person = people.find((item) => item.id === id);
  if (!person || !person.onboarded || person.accepted || person.cancelled || person.sector !== quota.sector) {
    return { ok: false as const, reason: "no se puede aceptar" };
  }
  const filled = people.filter((item) => occupies(item, quota.sector)).length;
  if (quota.capacity !== null && quota.capacity > 0 && filled >= quota.capacity) {
    return { ok: false as const, reason: "sector_lleno" };
  }
  return {
    ok: true as const,
    people: people.map((item) => (item.id === id ? { ...item, accepted: true } : item)),
  };
}

export function cancelSeat(people: SeatPerson[], id: string, reason: string) {
  const text = reason.trim();
  if (text.length < 1 || text.length > 280) return { ok: false as const, reason: "motivo" };
  const person = people.find((item) => item.id === id);
  if (!person || !occupies(person, person.sector)) return { ok: false as const, reason: "todavia_no_ocupa" };
  return {
    ok: true as const,
    people: people.map((item) => (item.id === id ? { ...item, cancelled: true } : item)),
  };
}
