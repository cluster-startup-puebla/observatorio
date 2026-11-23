import { instrumentChoice } from "@/lib/methodology/v2/sector-map";

export function showFirstEvaluation({
  sectorHasPack,
  finished,
  verified,
}: {
  sectorHasPack: boolean;
  finished: boolean;
  verified: boolean;
}) {
  return verified && sectorHasPack && !finished;
}

export function sectorHasPackFor(slug: string) {
  return instrumentChoice(slug).kind !== "none";
}
