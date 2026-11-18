import type { RunRow } from "./apply-run";

const runs = new Map<string, RunRow>();

export function memoryRuns() {
  return runs;
}

export function resetMemoryRuns() {
  runs.clear();
}

export function saveRun(profileId: string, result: { wrote: boolean; row: RunRow }) {
  if (result.wrote) runs.set(profileId, result.row);
}
