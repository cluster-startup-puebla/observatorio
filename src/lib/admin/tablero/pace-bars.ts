import type { PaceRow, TableroEvent } from "@/lib/admin/tablero/types";

const paceDays = 14;

export function mexicoDay(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function dayLabel(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, date)),
  );
}

function shiftDay(day: string, delta: number) {
  const [year, month, date] = day.split("-").map(Number);
  return mexicoDay(new Date(Date.UTC(year, month - 1, date + delta, 18)));
}

export function paceBars(events: TableroEvent[], inviteIds: Set<string>, now: Date): PaceRow[] {
  const end = mexicoDay(now);
  const days = Array.from({ length: paceDays }, (_, index) => shiftDay(end, index - (paceDays - 1)));
  const counts = new Map(days.map((day) => [day, 0]));
  for (const event of events) {
    if (!inviteIds.has(event.contactId)) continue;
    const parsed = new Date(event.occurredAt);
    if (Number.isNaN(parsed.getTime())) continue;
    const day = mexicoDay(parsed);
    if (!counts.has(day)) continue;
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return days.map((day) => ({ dia: dayLabel(day), confirmaciones: counts.get(day) ?? 0 }));
}
