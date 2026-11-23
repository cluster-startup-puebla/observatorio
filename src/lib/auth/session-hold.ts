export function holdsSession(input: { cancelled: boolean; linkPending: boolean }) {
  return input.cancelled || input.linkPending;
}
