export function holdsSession(input: {
  cancelled: boolean;
  linkPending: boolean;
  externalPending: boolean;
}) {
  return input.cancelled || input.linkPending || input.externalPending;
}
