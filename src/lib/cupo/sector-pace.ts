export function sectorPace(input: { capacity: number | null; mine: number; others: number }) {
  if (input.capacity === null || input.capacity <= 0) return { open: false as const };
  const filled = input.mine + input.others;
  return {
    open: true as const,
    capacity: input.capacity,
    mine: input.mine,
    others: input.others,
    filled,
    free: Math.max(input.capacity - filled, 0),
    full: filled >= input.capacity,
  };
}
