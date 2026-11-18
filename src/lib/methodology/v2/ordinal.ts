export const V2_ORDINAL_SCORES = [25, 50, 75, 100] as const;

export function ordinalScore(id: string, index: number): number {
  if (!Number.isInteger(index) || index < 0 || index >= V2_ORDINAL_SCORES.length) {
    throw new Error(`Option index ${index} has no ordinal score for question: ${id}`);
  }
  return V2_ORDINAL_SCORES[index];
}
