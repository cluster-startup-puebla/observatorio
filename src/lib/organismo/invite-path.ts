export function invitePath(sectorSlug: string, token: string, sessionId?: string | null) {
  const base = `/${sectorSlug}?${token}`;
  if (!sessionId) return base;
  return `${base}&sesion=${sessionId}`;
}

export function boundSessionId(requested: string, currentIds: string[]) {
  const id = requested.trim();
  if (currentIds.length === 0) return { ok: true as const, sessionId: null };
  if (id && currentIds.includes(id)) return { ok: true as const, sessionId: id };
  if (currentIds.length === 1) return { ok: true as const, sessionId: currentIds[0] };
  return { ok: false as const, reason: "Elige una sesión vigente." };
}
