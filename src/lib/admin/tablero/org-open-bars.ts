import { dayLabel, mexicoDay } from "@/lib/admin/tablero/pace-bars";

const days = 14;

function shiftDay(day: string, delta: number) {
  const [year, month, date] = day.split("-").map(Number);
  return mexicoDay(new Date(Date.UTC(year, month - 1, date + delta, 18)));
}

export type OrgOpenSeries = { key: string; name: string; total: number };

export function orgOpenBars(input: {
  orgs: { id: string; name: string }[];
  opens: { organizationId: string; at: string }[];
  now: Date;
}) {
  const end = mexicoDay(input.now);
  const axis = Array.from({ length: days }, (_, index) => shiftDay(end, index - (days - 1)));
  const names = new Map(input.orgs.map((org) => [org.id, org.name]));
  const counts = new Map<string, Map<string, number>>();
  for (const open of input.opens) {
    if (!names.has(open.organizationId)) continue;
    const parsed = new Date(open.at);
    if (Number.isNaN(parsed.getTime())) continue;
    const day = mexicoDay(parsed);
    if (!axis.includes(day)) continue;
    const tally = counts.get(open.organizationId) ?? new Map();
    tally.set(day, (tally.get(day) ?? 0) + 1);
    counts.set(open.organizationId, tally);
  }
  const active = input.orgs
    .map((org) => ({
      id: org.id,
      name: org.name,
      total: axis.reduce((sum, day) => sum + (counts.get(org.id)?.get(day) ?? 0), 0),
    }))
    .filter((org) => org.total > 0)
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "es"));
  const series: OrgOpenSeries[] = active.map((org, index) => ({ key: `o${index}`, name: org.name, total: org.total }));
  const keyOf = new Map(active.map((org, index) => [org.id, `o${index}`]));
  const bars = axis.map((day) => {
    const point: Record<string, string | number> = { dia: dayLabel(day) };
    for (const org of active) point[keyOf.get(org.id) ?? ""] = counts.get(org.id)?.get(day) ?? 0;
    return point;
  });
  return { bars, series };
}
