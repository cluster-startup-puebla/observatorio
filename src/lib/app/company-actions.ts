export type CompanyGap = "logo" | "website";

export type CompanyAction = {
  label: string;
  href: string;
};

export function companyActions(input: {
  gaps: readonly CompanyGap[];
  showEvaluation: boolean;
  sessionHref: string | null;
}): CompanyAction[] {
  const actions: CompanyAction[] = [];
  if (input.gaps.includes("logo")) {
    actions.push({ label: "Sube el logo de tu empresa", href: "/app/home" });
  }
  if (input.gaps.includes("website")) {
    actions.push({ label: "Agrega el sitio web", href: "/app/home" });
  }
  if (input.showEvaluation) {
    actions.push({ label: "Realiza tu primera evaluación", href: "/metodologia" });
  }
  if (input.sessionHref) {
    actions.push({ label: "Unirme a la sesión", href: input.sessionHref });
  }
  return actions;
}
