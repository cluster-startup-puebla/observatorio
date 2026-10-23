const accepted = new Set(["confirmo", "registrado", "llego"]);

export function isLinkAccepted(status: string | null) {
  return status === null || accepted.has(status);
}

export function pendingInviteAction(person: { source: string; status: string }) {
  if (person.status !== "cargado") return null;
  return person.source === "enlace" ? "aceptar" : "contactar";
}

export function passIsPending(statuses: (string | null)[]) {
  return statuses.some((status) => !isLinkAccepted(status));
}
