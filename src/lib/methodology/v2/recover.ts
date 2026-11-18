import type { V2Draft } from "./draft";

export function pickDraft(local: V2Draft | null, remote: V2Draft | null): V2Draft | null {
  if (!local) return remote;
  if (!remote) return local;
  const localCount = Object.keys(local.answers).length;
  const remoteCount = Object.keys(remote.answers).length;
  if (localCount !== remoteCount) return localCount > remoteCount ? local : remote;
  return local.updatedAt >= remote.updatedAt ? local : remote;
}
