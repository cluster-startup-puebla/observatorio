export function inviteMetadata(sector: string, invite: string) {
  return {
    intent: "empresario" as const,
    ...(sector ? { sector } : {}),
    ...(invite ? { invitacion: invite } : {}),
  };
}

export function inviteFromMetadata(metadata: unknown) {
  const bag = metadata && typeof metadata === "object" ? (metadata as Record<string, unknown>) : {};
  const invite = typeof bag.invitacion === "string" ? bag.invitacion.trim() : "";
  const sector = typeof bag.sector === "string" ? bag.sector.trim() : "";
  return { invite, sector };
}

export function withInvite(path: string, input: { sector: string; invite: string }) {
  if (path !== "/onboarding") return path;
  const query = new URLSearchParams();
  if (input.sector) query.set("sector", input.sector);
  if (input.invite) query.set("invitacion", input.invite);
  const search = query.toString();
  return search ? `${path}?${search}` : path;
}
