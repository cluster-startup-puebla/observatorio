import { dayLabel, mexicoDay } from "@/lib/admin/tablero/pace-bars";

const days = 14;

function shiftDay(day: string, delta: number) {
  const [year, month, date] = day.split("-").map(Number);
  return mexicoDay(new Date(Date.UTC(year, month - 1, date + delta, 18)));
}

export function linkStats(input: { opens: { at: string }[]; conversions: number; now: Date }) {
  const end = mexicoDay(input.now);
  const axis = Array.from({ length: days }, (_, index) => shiftDay(end, index - (days - 1)));
  const counts = new Map(axis.map((day) => [day, 0]));
  for (const open of input.opens) {
    const parsed = new Date(open.at);
    if (Number.isNaN(parsed.getTime())) continue;
    const day = mexicoDay(parsed);
    if (!counts.has(day)) continue;
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  const rate = input.opens.length === 0 ? 0 : Math.round((input.conversions / input.opens.length) * 100);
  return {
    opens: input.opens.length,
    conversions: input.conversions,
    rate,
    bars: axis.map((day) => ({ dia: dayLabel(day), aperturas: counts.get(day) ?? 0 })),
  };
}
