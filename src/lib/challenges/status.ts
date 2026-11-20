export const CHALLENGE_STATUSES = ["borrador", "publicado", "oculto", "cerrado"] as const;
export type ChallengeStatus = (typeof CHALLENGE_STATUSES)[number];

export const CHALLENGE_VISIBILITIES = ["portal", "red"] as const;
export type ChallengeVisibility = (typeof CHALLENGE_VISIBILITIES)[number];

export const CHALLENGE_URGENCIES = ["baja", "media", "alta"] as const;
export type ChallengeUrgency = (typeof CHALLENGE_URGENCIES)[number];

export const statusLabel: Record<ChallengeStatus, string> = {
  borrador: "Borrador",
  publicado: "Publicado",
  oculto: "Oculto",
  cerrado: "Cerrado",
};

export const visibilityLabel: Record<ChallengeVisibility, string> = {
  portal: "Portal público",
  red: "Solo red",
};
