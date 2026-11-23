import "server-only";

import { resolveCrmSessionId } from "./crm-query";
import { loadCrmSessions } from "./crm-sessions";
import { orgSessionIdBySlug } from "./session-id-by-slug";

export async function crmSessionChoice(querySesion: string | undefined, routeSlug?: string | null) {
  const sessions = await loadCrmSessions();
  const routeSessionId = routeSlug ? await orgSessionIdBySlug(routeSlug) : null;
  const selectedId = resolveCrmSessionId(querySesion, routeSessionId);
  return { sessions, selectedId, routeSessionId };
}
