export const disclaimerCookie = "metodologia-aviso";

export function needsDisclaimer(input: { acceptedAt: string | null; started: boolean }) {
  if (input.acceptedAt) return false;
  if (input.started) return false;
  return true;
}

export function draftStarted(index: number, answerCount: number) {
  return index > 0 || answerCount > 0;
}
