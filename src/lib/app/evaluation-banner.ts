import { instrumentChoice } from "@/lib/methodology/v2/sector-map";

export function showFirstEvaluation({
  sectorHasPack,
  finished,
}: {
  sectorHasPack: boolean;
  finished: boolean;
}) {
  return sectorHasPack && !finished;
}

export function sectorHasPackFor(slug: string) {
  return instrumentChoice(slug).kind !== "none";
}
