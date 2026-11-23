import index from "@/content/methodology/v2/index.json";

type InstrumentRow = { id: string; label: string };

export function instrumentOptions(): InstrumentRow[] {
  const rows = (index as { instruments?: InstrumentRow[] }).instruments ?? [];
  return rows.map((row) => ({ id: row.id, label: row.label }));
}

export function isKnownInstrument(id: string) {
  return instrumentOptions().some((row) => row.id === id);
}
