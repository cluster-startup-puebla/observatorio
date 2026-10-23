import { invitePath } from "@/lib/organismo/invite-path";

export function brandStamp(input: { name: string | null; brandColor: string | null; hasLogo: boolean }) {
  if (!input.name || !input.brandColor || !input.hasLogo) return null;
  return new Date().toISOString();
}

export function eventPath(sectorSlug: string, token: string, sessionId?: string | null) {
  return invitePath(sectorSlug, token, sessionId);
}
