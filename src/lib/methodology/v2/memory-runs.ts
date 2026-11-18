import type { RunRow } from "./apply-run";

const globalKey = "__observatorioMethodologyV2Runs";

type Bag = typeof globalThis & { [globalKey]?: Map<string, RunRow> };

function runs() {
  const bag = globalThis as Bag;
  if (!bag[globalKey]) bag[globalKey] = new Map();
  return bag[globalKey];
}

export function memoryRuns() {
  return runs();
}

export function resetMemoryRuns() {
  runs().clear();
}

export function saveRun(profileId: string, result: { wrote: boolean; row: RunRow }) {
  if (result.wrote) runs().set(profileId, result.row);
}
