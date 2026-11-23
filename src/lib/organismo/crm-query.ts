export function resolveCrmSessionId(
  querySesion: string | undefined,
  routeSessionId: string | null,
): string | null {
  if (querySesion === "todas") return null;
  if (querySesion) return querySesion;
  return routeSessionId;
}

export function crmHref(parts: { vista?: string; estado?: string; sesion?: string }) {
  const query = new URLSearchParams();
  if (parts.vista) query.set("vista", parts.vista);
  if (parts.estado) query.set("estado", parts.estado);
  if (parts.sesion) query.set("sesion", parts.sesion);
  const text = query.toString();
  return text ? `?${text}` : "?";
}
