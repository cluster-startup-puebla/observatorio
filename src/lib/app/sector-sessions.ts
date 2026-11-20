export type SectorSession = {
  publicSlug: string;
  title: string;
  sessionOn: string;
  venue: string;
};

export function splitSessions(rows: SectorSession[], today: string) {
  const upcoming = rows
    .filter((row) => row.sessionOn >= today)
    .sort((a, b) => a.sessionOn.localeCompare(b.sessionOn));
  const past = rows
    .filter((row) => row.sessionOn < today)
    .sort((a, b) => b.sessionOn.localeCompare(a.sessionOn));
  return { upcoming, past };
}

export function nextForSector(rows: SectorSession[], today: string) {
  return splitSessions(rows, today).upcoming[0] ?? null;
}
