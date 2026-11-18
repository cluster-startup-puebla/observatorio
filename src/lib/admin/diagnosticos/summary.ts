export type ClosedRun = {
  instrumentId: string;
  score: { ismsNivel2?: number; band?: string } | null;
};

export type InstrumentAverage = {
  instrumentId: string;
  average: number;
  finished: number;
};

export type ScoreSummary = {
  average: number | null;
  finished: number;
  bands: Record<string, number>;
  byInstrument: InstrumentAverage[];
};

type Note = { instrumentId: string; ismsNivel2: number; band?: string };

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function mean(values: number[]) {
  return round2(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function noteOf(row: ClosedRun): Note | null {
  if (!row.score || typeof row.score.ismsNivel2 !== "number") return null;
  return { instrumentId: row.instrumentId, ismsNivel2: row.score.ismsNivel2, band: row.score.band };
}

export function summarize(rows: ClosedRun[]): ScoreSummary {
  const notes = rows.flatMap((row) => {
    const note = noteOf(row);
    return note ? [note] : [];
  });
  const bands: Record<string, number> = {};
  const groups = new Map<string, number[]>();
  for (const note of notes) {
    if (note.band) bands[note.band] = (bands[note.band] ?? 0) + 1;
    const values = groups.get(note.instrumentId) ?? [];
    values.push(note.ismsNivel2);
    groups.set(note.instrumentId, values);
  }
  return {
    average: notes.length ? mean(notes.map((note) => note.ismsNivel2)) : null,
    finished: notes.length,
    bands,
    byInstrument: [...groups.entries()].map(([instrumentId, values]) => ({
      instrumentId,
      average: mean(values),
      finished: values.length,
    })),
  };
}
