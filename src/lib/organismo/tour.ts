export type TourPhase = "home" | "crm";

export type TourStep = {
  element: "sector" | "sesion" | "generar" | "crm";
  title: string;
  description: string;
};

export function sessionCopy(count: number) {
  if (count === 1) return "Hoy la sesión es una sola, la vigente.";
  return "Elige la sesión. El enlace queda para la que elijas.";
}

export function tourStart(input: { path: string; tour: boolean; seen: boolean }) {
  if (input.seen) return null;
  if (input.path.endsWith("/crm")) return input.tour ? "crm" : null;
  return "home";
}

export function tourSteps(phase: TourPhase, sessions: number): TourStep[] {
  if (phase === "crm") {
    return [
      {
        element: "crm",
        title: "Acepta a tus invitados",
        description: "En esta tabla vas a aceptar a tus invitados.",
      },
    ];
  }
  const steps: TourStep[] = [
    {
      element: "sector",
      title: "El sector",
      description: "Elige el sector que vas a convocar.",
    },
  ];
  if (sessions > 0) {
    steps.push({ element: "sesion", title: "La sesión", description: sessionCopy(sessions) });
  }
  steps.push({
    element: "generar",
    title: "La invitación",
    description: "Con este botón generas la invitación. Un solo enlace para todo tu sector.",
  });
  return steps;
}
