export const metodologiaReloadCookie = "metodologia-recarga";

export const metodologiaReloadAssignment = "metodologia-recarga=1; Path=/; SameSite=Lax";

export type MetodologiaReloadPlan = {
  showNotice: boolean;
  redirectTo: "/onboarding" | null;
  clearCookie: boolean;
};

export function metodologiaReloadPlan(
  eventOpen: boolean,
  cookie: string | undefined,
): MetodologiaReloadPlan {
  if (eventOpen) return { showNotice: false, redirectTo: null, clearCookie: false };
  if (cookie === "1") return { showNotice: false, redirectTo: "/onboarding", clearCookie: true };
  return { showNotice: true, redirectTo: null, clearCookie: false };
}
